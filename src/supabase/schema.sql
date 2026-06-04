-- Reset existing experiment tables
drop table if exists votes cascade;
drop table if exists questions cascade;
drop table if exists voters cascade;

-- Voters Table (stores usernames and coin balance)
create table voters (
  voter_id     text primary key,
  username     text not null,
  coins        integer default 0,
  created_at   timestamptz default now()
);

-- Questions Table (stores fitness/nutrition poll questions)
create table questions (
  id             uuid primary key default gen_random_uuid(),
  body           text not null,
  options        text[] not null,          -- choices array
  correct_option integer not null,         -- index (0-3)
  explanation    text not null,            -- educational text
  category       text not null,            -- e.g. 'Strength', 'Nutrition', etc.
  points         integer default 10,       -- coins rewarded
  created_at     timestamptz default now()
);

-- Votes Table (associates a voter's selection on a question)
create table votes (
  id              uuid primary key default gen_random_uuid(),
  question_id     uuid not null references questions(id) on delete cascade,
  voter_id        text not null references voters(voter_id) on delete cascade,
  selected_option integer not null,
  is_correct      boolean not null,
  created_at      timestamptz default now(),
  unique (question_id, voter_id)
);

create index votes_question_id_idx on votes (question_id);
create index votes_voter_id_idx on votes (voter_id);

-- Seed Questions (10 Fitness Questions)
insert into questions (body, options, correct_option, explanation, category, points)
values
  (
    'What is the primary muscle group targeted by the squat exercise?',
    array['Pectorals (Chest)', 'Quadriceps (Thighs)', 'Latissimus Dorsi (Back)', 'Biceps (Arms)'],
    1,
    'Squats are a compound movement that primarily target the quadriceps, along with the glutes, hamstrings, and core muscles.',
    'Strength',
    10
  ),
  (
    'Which macronutrient is the body''s primary and preferred source of quick energy during high-intensity exercise?',
    array['Fats', 'Proteins', 'Carbohydrates', 'Vitamins'],
    2,
    'Carbohydrates are broken down into glucose, which is the most efficient and preferred energy source for high-intensity muscular contractions.',
    'Nutrition',
    10
  ),
  (
    'What does the acronym HIIT stand for in cardiovascular training?',
    array['High-Intensity Interval Training', 'Heavy-Iron Isometric Tension', 'Heart-rate Induced Interval Therapy', 'Hypertrophy Intensity Interval Trios'],
    0,
    'HIIT stands for High-Intensity Interval Training, which alternates short bursts of intense exercise with low-intensity recovery periods.',
    'Cardio',
    10
  ),
  (
    'To optimize muscle protein synthesis and recovery, how much protein is generally recommended per kilogram of body weight for active lifters?',
    array['0.5 to 0.8 grams', '1.6 to 2.2 grams', '3.0 to 4.0 grams', 'No protein needed'],
    1,
    'Scientific consensus suggests that consuming 1.6 to 2.2 grams of protein per kilogram of body weight is ideal for supporting muscle growth and repair.',
    'Nutrition',
    10
  ),
  (
    'Which type of stretching is best performed BEFORE a workout to prepare muscles and joints for movement?',
    array['Static stretching (holding a pose)', 'Dynamic stretching (active movements)', 'Ballistic stretching (bouncing)', 'Passive stretching'],
    1,
    'Dynamic stretching increases range of motion, heart rate, and blood flow, making it ideal before exercise. Static stretching is best reserved for post-workout.',
    'Flexibility',
    10
  ),
  (
    'What is hypertrophy in the context of fitness?',
    array['An increase in muscle size', 'A decrease in body fat percentage', 'An increase in resting heart rate', 'Muscle soreness after lifting'],
    0,
    'Hypertrophy is the enlargement of an organ or tissue from the increase in size of its cells, commonly referring to muscle growth from resistance training.',
    'Strength',
    10
  ),
  (
    'How many active minutes of moderate-intensity exercise does the World Health Organization (WHO) recommend per week for adults?',
    array['30 minutes', '75 minutes', '150 minutes', '300 minutes'],
    2,
    'The WHO recommends at least 150 minutes of moderate-intensity or 75 minutes of vigorous-intensity aerobic physical activity per week for health benefits.',
    'Health',
    10
  ),
  (
    'Which muscle is primarily engaged in stabilizing the spine and pelvis during core movements?',
    array['Rectus abdominis (six-pack)', 'Transversus abdominis (deep core)', 'Biceps femoris', 'Trapezius'],
    1,
    'The transversus abdominis acts as a natural corset, stabilizing the spine and pelvis, and is key for core stability and preventing back pain.',
    'Core',
    10
  ),
  (
    'What is the term for the amount of energy (calories) your body burns at rest just to maintain basic physiological functions?',
    array['Total Daily Energy Expenditure (TDEE)', 'Active Metabolic Rate (AMR)', 'Basal Metabolic Rate (BMR)', 'Thermic Effect of Food (TEF)'],
    2,
    'Basal Metabolic Rate (BMR) is the minimum number of calories your body needs to function at rest, excluding any physical activity.',
    'Nutrition',
    10
  ),
  (
    'What is the primary cause of delayed onset muscle soreness (DOMS)?',
    array['Lactic acid buildup', 'Microscopic tears in muscle fibers', 'Dehydration', 'Calcium deficiency'],
    1,
    'DOMS is caused by microscopic tears in muscle fibers during intense eccentric exercise, which trigger an inflammatory response. Lactic acid is cleared quickly and is not the cause.',
    'Recovery',
    10
  );
