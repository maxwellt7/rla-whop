import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create data directory if it doesn't exist
const dataDir = join(__dirname, '..', '..', 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const dbPath = join(dataDir, 'rapid-launch.db');
export const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Initialize database schema
export function initializeDatabase() {
  db.exec(`
    -- Projects table
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      current_step INTEGER DEFAULT 1,
      offer_data TEXT,
      avatar_data TEXT,
      competitors_data TEXT,
      manifold_data TEXT
    );

    -- Launch Document Generations table (tracks generation jobs)
    CREATE TABLE IF NOT EXISTS launch_doc_generations (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending', 'in_progress', 'completed', 'failed')),
      total_sections INTEGER NOT NULL DEFAULT 38,
      completed_sections INTEGER NOT NULL DEFAULT 0,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      error_message TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    -- Launch Document Sections table (stores individual sections)
    CREATE TABLE IF NOT EXISTS launch_doc_sections (
      id TEXT PRIMARY KEY,
      generation_id TEXT NOT NULL,
      section_number INTEGER NOT NULL,
      section_title TEXT NOT NULL,
      section_key TEXT NOT NULL,
      content TEXT NOT NULL,
      generated_at TEXT NOT NULL,
      FOREIGN KEY (generation_id) REFERENCES launch_doc_generations(id) ON DELETE CASCADE,
      UNIQUE(generation_id, section_number)
    );

    -- Indexes for better query performance
    CREATE INDEX IF NOT EXISTS idx_generations_project ON launch_doc_generations(project_id);
    CREATE INDEX IF NOT EXISTS idx_sections_generation ON launch_doc_sections(generation_id);
    CREATE INDEX IF NOT EXISTS idx_generations_status ON launch_doc_generations(status);
  `);

  console.log('✅ Database initialized at:', dbPath);
}

// Helper functions for Launch Document Generation
export const launchDocDB = {
  // Create a new generation job
  createGeneration: (projectId) => {
    const id = `gen_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const stmt = db.prepare(`
      INSERT INTO launch_doc_generations (id, project_id, status, started_at)
      VALUES (?, ?, 'pending', ?)
    `);
    stmt.run(id, projectId, new Date().toISOString());
    return id;
  },

  // Update generation status
  updateGenerationStatus: (generationId, status, errorMessage = null) => {
    const stmt = db.prepare(`
      UPDATE launch_doc_generations
      SET status = ?, completed_at = ?, error_message = ?
      WHERE id = ?
    `);
    const completedAt = status === 'completed' || status === 'failed' ? new Date().toISOString() : null;
    stmt.run(status, completedAt, errorMessage, generationId);
  },

  // Save a section
  saveSection: (generationId, sectionNumber, sectionTitle, sectionKey, content) => {
    const id = `sec_${Date.now()}_${sectionNumber}`;
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO launch_doc_sections
      (id, generation_id, section_number, section_title, section_key, content, generated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, generationId, sectionNumber, sectionTitle, sectionKey, content, new Date().toISOString());

    // Update completed sections count
    const updateStmt = db.prepare(`
      UPDATE launch_doc_generations
      SET completed_sections = (
        SELECT COUNT(*) FROM launch_doc_sections WHERE generation_id = ?
      )
      WHERE id = ?
    `);
    updateStmt.run(generationId, generationId);
  },

  // Get generation progress
  getGenerationProgress: (generationId) => {
    const stmt = db.prepare(`
      SELECT * FROM launch_doc_generations WHERE id = ?
    `);
    return stmt.get(generationId);
  },

  // Get latest generation for a project
  getLatestGeneration: (projectId) => {
    const stmt = db.prepare(`
      SELECT * FROM launch_doc_generations
      WHERE project_id = ?
      ORDER BY started_at DESC
      LIMIT 1
    `);
    return stmt.get(projectId);
  },

  // Get all sections for a generation
  getSections: (generationId) => {
    const stmt = db.prepare(`
      SELECT * FROM launch_doc_sections
      WHERE generation_id = ?
      ORDER BY section_number ASC
    `);
    return stmt.all(generationId);
  },

  // Get completed sections for resume functionality
  getCompletedSectionNumbers: (generationId) => {
    const stmt = db.prepare(`
      SELECT section_number FROM launch_doc_sections
      WHERE generation_id = ?
      ORDER BY section_number ASC
    `);
    return stmt.all(generationId).map(row => row.section_number);
  },
};

// Initialize on module load
initializeDatabase();
