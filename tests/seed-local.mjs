/**
 * Local-only E2E seed. REFUSES to run against non-localhost databases.
 *
 * Usage:
 *   node tests/seed-local.mjs
 *
 * Creates (idempotently): admin teacher + logout-only teacher, current
 * semester, classroom "E2E ป.4/1" with two enrolled students.
 * Required by tests/students-crud.spec.ts (login users),
 * tests/attendance.spec.ts and tests/behavior.spec.ts (classroom data).
 * Credentials are printed for E2E_TEST_EMAIL / E2E_LOGOUT_EMAIL runs.
 */
import { createClient } from "@supabase/supabase-js";

const URL = process.env.E2E_SUPABASE_URL ?? "http://127.0.0.1:54321";
const SECRET = process.env.E2E_SUPABASE_SERVICE_KEY ?? "";

if (!/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(URL)) {
  throw new Error(`seed-local refuses non-local database: ${URL}`);
}
if (!SECRET) {
  throw new Error("E2E_SUPABASE_SERVICE_KEY is required (local supabase secret key)");
}

const TEACHER = { email: "e2e.teacher@test.local", password: "E2eTest1234!" };
const LOGOUT = { email: "e2e.logout@test.local", password: "E2eLogout1234!" };
const SCHOOL = "00000000-0000-0000-0000-000000000000";

const admin = createClient(URL, SECRET, { auth: { persistSession: false } });

async function ensureUser(email, password, firstName, lastName) {
  // Never delete: FK references (attendance, risk, audit, ...) block hard
  // deletes. Reuse the account and reset its password instead.
  const { data: existing } = await admin.auth.admin.listUsers();
  const found = existing.users.find((u) => u.email === email);
  let id;
  if (found) {
    id = found.id;
    const { error } = await admin.auth.admin.updateUserById(id, {
      password,
      email_confirm: true,
    });
    if (error) throw error;
  } else {
    const res = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (res.error) throw res.error;
    id = res.data.user.id;
  }
  await admin.from("profiles").upsert(
    {
      id,
      school_id: SCHOOL,
      role: "admin",
      first_name: firstName,
      last_name: lastName,
      email,
      is_active: true,
    },
    { onConflict: "id" },
  );
  return id;
}

await admin.from("academic_years").upsert(
  {
    id: "22222222-2222-2222-2222-222222222222",
    school_id: SCHOOL,
    year: 2568,
    start_date: "2026-01-01",
    end_date: "2027-03-31",
    is_current: true,
  },
  { onConflict: "id" },
);
await admin.from("semesters").upsert(
  {
    id: "33333333-3333-3333-3333-333333333333",
    school_id: SCHOOL,
    academic_year_id: "22222222-2222-2222-2222-222222222222",
    semester: "semester_1",
    start_date: "2026-05-01",
    end_date: "2026-10-31",
    is_current: true,
  },
  { onConflict: "id" },
);

await ensureUser(TEACHER.email, TEACHER.password, "E2E", "Teacher");
await ensureUser(LOGOUT.email, LOGOUT.password, "E2E", "Logout");

let classroomId;
{
  const { data: existing } = await admin
    .from("classrooms")
    .select("id, name")
    .eq("school_id", SCHOOL)
    .eq("academic_year_id", "22222222-2222-2222-2222-222222222222")
    .eq("grade_level", "p4")
    .eq("section", 1)
    .maybeSingle();
  if (existing) {
    classroomId = existing.id;
    if (existing.name !== "E2E ป.4/1") {
      await admin.from("classrooms").update({ name: "E2E ป.4/1" }).eq("id", existing.id);
    }
  } else {
    const { data, error } = await admin
      .from("classrooms")
      .insert({
        school_id: SCHOOL,
        academic_year_id: "22222222-2222-2222-2222-222222222222",
        grade_level: "p4",
        section: 1,
        name: "E2E ป.4/1",
        is_active: true,
      })
      .select("id")
      .single();
    if (error) throw error;
    classroomId = data.id;
  }
}

for (const [code, first, last] of [
  ["E2EATT001", "อีทูอี", "แอทวัน"],
  ["E2EATT002", "อีทูอี", "แอททู"],
]) {
  const { data: student, error } = await admin
    .from("students")
    .upsert(
      {
        school_id: SCHOOL,
        student_code: code,
        first_name: first,
        last_name: last,
        gender: "male",
        date_of_birth: "2015-01-01",
        status: "active",
      },
      { onConflict: "school_id,student_code" },
    )
    .select("id")
    .single();
  if (error) throw error;
  await admin.from("classroom_students").upsert(
    {
      school_id: SCHOOL,
      classroom_id: classroomId,
      student_id: student.id,
      semester_id: "33333333-3333-3333-3333-333333333333",
      is_active: true,
    },
    { onConflict: "student_id,semester_id" },
  ).then(({ error }) => {
    if (error) throw error;
  });
}

console.log("seed ok");
console.log(`E2E_TEST_EMAIL=${TEACHER.email} E2E_TEST_PASSWORD=${TEACHER.password}`);
console.log(`E2E_LOGOUT_EMAIL=${LOGOUT.email} E2E_LOGOUT_PASSWORD=${LOGOUT.password}`);
