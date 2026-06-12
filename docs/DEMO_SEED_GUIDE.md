# Demo Seed Guide - SCIDAS

## Quick Start
This workspace copy is already prepared for:

```text
amin@rpg41.ac.th
user/profile id: 4040cb4e-6c18-41aa-b2dc-73f63103e52e
school id: 45ef7b2c-5be1-4774-8f46-d1035fe3151e
```

1. Open Supabase SQL Editor.
2. Paste the whole `supabase/seed_demo_connected.sql` file.
3. Run it.

To switch to another user later, find your auth user UUID:
   ```sql
   SELECT id, email FROM auth.users;
   ```
Then replace every occurrence of:
   ```text
   4040cb4e-6c18-41aa-b2dc-73f63103e52e
   ```
with the new `auth.users.id`.

The seed is designed to be re-runnable. Generated demo rows use stable IDs and conflict guards, so repeated runs should not duplicate the seeded demo data.

## Prerequisites
- Supabase project with migrations `0001` through `0008` applied.
- At least one Supabase Auth user.
- The seed expects the `uuid-ossp` and `pgcrypto` extensions from the migrations.

## What Gets Seeded

| Table | Rows | Notes |
|---|---:|---|
| schools | 1 | Demo school |
| academic_years | 1 | Current academic year |
| semesters | 2 | Semester 1 current |
| profiles | 1 | Admin profile using your auth UUID |
| students | 45 | Grades P4-M3 |
| guardians | 10 | Demo guardians |
| student_guardians | 9 | Guardian links |
| classrooms | 6 | One classroom per grade |
| classroom_students | 45 | Current semester enrollments |
| subjects | 10 | Core subjects |
| classroom_subjects | 30 | 5 subjects x 6 classrooms |
| attendance_records | ~135 | 3 dates x 45 students |
| academic_scores | ~225 | 5 subjects x 45 students |
| behavior_records | 80 | Stable demo behavior rows |
| risk_assessments | 45 | One assessment per student |
| risk_factors | varies | Factors for watch/high risk students |
| support_records | 12 | Stable demo support rows |
| development_plans | up to 8 | For watch/high risk students |
| development_goals | up to 8 | One goal per demo plan |
| home_visits | 15 | Stable demo visit rows |
| report_jobs | 5 | All statuses represented |
| notifications | 6 | 2 unread |
| student_notes | 10 | Team notes |

## Verification
After the seed runs, copy only the verification query at the bottom of `supabase/seed_demo_connected.sql` into a new SQL Editor query and run it.

Do not uncomment the verification block and re-run the whole file just to check counts. Running the whole file is safe, but a separate verification query is clearer and faster.

## Notes
- A single admin profile is used for all staff foreign keys.
- Student photos are not seeded; the app should use initials fallback.
- Academic scores and risk values are demo data, not computed from a real grading model.
- Home visits do not include images.
