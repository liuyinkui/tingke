/**
 * Initial schema — 创建所有基础表
 *
 * Tables:
 *   users              — 用户
 *   materials          — 学习素材
 *   dictation_records  — 听写记录
 *   recording_records  — 跟读录音记录
 *   checkins           — 每日打卡
 *   user_words         — 用户单词本
 */
exports.up = async function (knex) {
  // ── users ────────────────────────────────────────────────
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('nickname', 100).notNullable();
    table.string('avatar', 500).nullable();
    table.string('level', 10).notNullable().defaultTo('L1');
    table.integer('daily_goal').notNullable().defaultTo(15);
    table.string('accent_pref', 10).notNullable().defaultTo('us');
    table.timestamp('first_checked_in_at', { useTz: true }).nullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  // ── materials ────────────────────────────────────────────
  await knex.schema.createTable('materials', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title', 200).notNullable();
    table.string('difficulty', 10).notNullable();
    table.integer('duration').notNullable(); // seconds
    table.string('audio_url', 500).notNullable();
    table.text('transcript').notNullable();
    table.jsonb('sentence_timeline').notNullable();
    table.jsonb('word_list').nullable();
    table.specificType('topics', 'varchar(50)[]').nullable();
    table.string('status', 20).notNullable().defaultTo('draft');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
  await knex.raw('CREATE INDEX idx_materials_difficulty ON materials (difficulty)');
  await knex.raw('CREATE INDEX idx_materials_status ON materials (status)');

  // ── dictation_records ────────────────────────────────────
  await knex.schema.createTable('dictation_records', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table
      .uuid('material_id')
      .notNullable()
      .references('id')
      .inTable('materials')
      .onDelete('CASCADE');
    table.integer('sentence_index').notNullable();
    table.text('user_text').notNullable();
    table.boolean('is_correct').notNullable();
    table.jsonb('errors').nullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
  await knex.raw(
    'CREATE INDEX idx_dictation_user_material ON dictation_records (user_id, material_id)'
  );

  // ── recording_records ────────────────────────────────────
  await knex.schema.createTable('recording_records', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table
      .uuid('material_id')
      .notNullable()
      .references('id')
      .inTable('materials')
      .onDelete('CASCADE');
    table.string('audio_url', 500).notNullable();
    table.float('score').notNullable();
    table.jsonb('details').nullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
  await knex.raw(
    'CREATE INDEX idx_recording_user_material ON recording_records (user_id, material_id)'
  );

  // ── checkins ─────────────────────────────────────────────
  await knex.schema.createTable('checkins', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.date('checkin_date').notNullable();
    table.integer('streak_count').notNullable().defaultTo(1);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.unique(['user_id', 'checkin_date']);
  });

  // ── user_words ───────────────────────────────────────────
  await knex.schema.createTable('user_words', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('word', 100).notNullable();
    table.text('sentence').notNullable();
    table
      .uuid('material_id')
      .notNullable()
      .references('id')
      .inTable('materials')
      .onDelete('CASCADE');
    table.boolean('is_mastered').notNullable().defaultTo(false);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
  await knex.raw('CREATE INDEX idx_user_words_user ON user_words (user_id)');
  await knex.raw('CREATE INDEX idx_user_words_mastered ON user_words (user_id, is_mastered)');
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('user_words');
  await knex.schema.dropTableIfExists('checkins');
  await knex.schema.dropTableIfExists('recording_records');
  await knex.schema.dropTableIfExists('dictation_records');
  await knex.schema.dropTableIfExists('materials');
  await knex.schema.dropTableIfExists('users');
};
