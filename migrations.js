/**
 * Este arquivo descreve a estrutura inicial das tabelas necessárias para uma base relacional
 * responsável pelo sistema de ponto. No futuro ele poderá ser integrado a uma ferramenta de
 * migrations (como Knex, Sequelize ou Prisma). Por enquanto mantemos a definição das tabelas
 * e campos para facilitar a evolução da aplicação.
 */

const migrations = [
  {
    id: '001_create_employees_table',
    description: 'Cadastro de colaboradores com informações básicas e status',
    up: async (db) => {
      await db.schema.createTable('employees', (table) => {
        table.uuid('id').primary();
        table.string('registration', 32).notNullable().unique();
        table.string('name', 120).notNullable();
        table.string('role', 120);
        table.string('department', 120);
        table.boolean('active').notNullable().defaultTo(true);
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.timestamp('updated_at').defaultTo(db.fn.now());
      });
    },
    down: async (db) => {
      await db.schema.dropTable('employees');
    }
  },
  {
    id: '002_create_punches_table',
    description: 'Tabela principal das batidas, vinculada ao colaborador e ao lote de importação',
    up: async (db) => {
      await db.schema.createTable('punches', (table) => {
        table.uuid('id').primary();
        table.string('punch_identifier', 16).notNullable().unique();
        table.uuid('employee_id').notNullable().references('employees.id');
        table.date('punch_date').notNullable();
        table.time('punch_time').notNullable();
        table.timestamp('timestamp').notNullable();
        table.uuid('import_id').references('imports.id');
        table.string('source', 64).defaultTo('manual');
        table.jsonb('raw_payload');
        table.timestamp('created_at').defaultTo(db.fn.now());
      });
    },
    down: async (db) => {
      await db.schema.dropTable('punches');
    }
  },
  {
    id: '003_create_imports_table',
    description: 'Controle de arquivos importados e métricas de processamento',
    up: async (db) => {
      await db.schema.createTable('imports', (table) => {
        table.uuid('id').primary();
        table.string('filename', 160);
        table.integer('total_records').notNullable().defaultTo(0);
        table.integer('inserted_records').notNullable().defaultTo(0);
        table.integer('duplicate_records').notNullable().defaultTo(0);
        table.timestamp('processed_at').defaultTo(db.fn.now());
        table.text('notes');
      });
    },
    down: async (db) => {
      await db.schema.dropTable('imports');
    }
  },
  {
    id: '004_create_daily_totals_view',
    description: 'Visão materializada para acelerar relatórios por colaborador e por dia',
    up: async (db) => {
      await db.schema.createTable('daily_totals', (table) => {
        table.uuid('id').primary();
        table.uuid('employee_id').notNullable().references('employees.id');
        table.date('punch_date').notNullable();
        table.integer('punch_count').notNullable().defaultTo(0);
        table.timestamps(true, true);
      });
    },
    down: async (db) => {
      await db.schema.dropTable('daily_totals');
    }
  }
];

module.exports = {
  migrations
};
