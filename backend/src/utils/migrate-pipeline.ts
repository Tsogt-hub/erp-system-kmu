// Migration-Script für Pipeline-Features
// Fügt project_type und pipeline_step Spalten hinzu, falls sie nicht existieren

import { query } from '../config/database';

export async function migratePipelineColumns() {
  try {
    console.log('🔄 Migriere Pipeline-Spalten...');

    // Prüfe ob Spalten existieren (SQLite)
    const checkColumns = await query(`
      PRAGMA table_info(projects)
    `);

    const columns = Array.isArray(checkColumns) ? checkColumns : checkColumns.rows;
    const columnNames = columns.map((col: any) => col.name);

    // Füge project_type hinzu, falls nicht vorhanden
    if (!columnNames.includes('project_type')) {
      console.log('➕ Füge project_type Spalte hinzu...');
      await query(`
        ALTER TABLE projects 
        ADD COLUMN project_type TEXT DEFAULT 'general'
      `);
      console.log('✅ project_type Spalte hinzugefügt');
    }

    // Füge pipeline_step hinzu, falls nicht vorhanden
    if (!columnNames.includes('pipeline_step')) {
      console.log('➕ Füge pipeline_step Spalte hinzu...');
      await query(`
        ALTER TABLE projects 
        ADD COLUMN pipeline_step TEXT DEFAULT 'new_contact'
      `);
      console.log('✅ pipeline_step Spalte hinzugefügt');
    }

    // Update bestehende Projekte
    await query(`
      UPDATE projects 
      SET project_type = 'general', pipeline_step = 'new_contact' 
      WHERE project_type IS NULL OR pipeline_step IS NULL
    `);

    console.log('✅ Migration abgeschlossen');
    return true;
  } catch (error: any) {
    // PostgreSQL-spezifische Migration
    if (error.message?.includes('PRAGMA')) {
      try {
        // Für PostgreSQL: Prüfe ob Spalten existieren
        const checkProjectType = await query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'projects' AND column_name = 'project_type'
        `);
        
        const checkPipelineStep = await query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'projects' AND column_name = 'pipeline_step'
        `);

        const hasProjectType = Array.isArray(checkProjectType) 
          ? checkProjectType.length > 0 
          : checkProjectType.rows.length > 0;
        
        const hasPipelineStep = Array.isArray(checkPipelineStep) 
          ? checkPipelineStep.length > 0 
          : checkPipelineStep.rows.length > 0;

        if (!hasProjectType) {
          await query(`ALTER TABLE projects ADD COLUMN project_type TEXT DEFAULT 'general'`);
          console.log('✅ project_type Spalte hinzugefügt (PostgreSQL)');
        }

        if (!hasPipelineStep) {
          await query(`ALTER TABLE projects ADD COLUMN pipeline_step TEXT DEFAULT 'new_contact'`);
          console.log('✅ pipeline_step Spalte hinzugefügt (PostgreSQL)');
        }

        await query(`
          UPDATE projects 
          SET project_type = COALESCE(project_type, 'general'), 
              pipeline_step = COALESCE(pipeline_step, 'new_contact') 
          WHERE project_type IS NULL OR pipeline_step IS NULL
        `);

        console.log('✅ Migration abgeschlossen (PostgreSQL)');
        return true;
      } catch (pgError: any) {
        console.error('❌ Migration fehlgeschlagen:', pgError.message);
        return false;
      }
    }

    console.error('❌ Migration fehlgeschlagen:', error.message);
    return false;
  }
}

// Auto-migrate on import (wenn als Script ausgeführt)
if (require.main === module) {
  migratePipelineColumns()
    .then((success) => {
      if (success) {
        console.log('🎉 Migration erfolgreich');
        process.exit(0);
      } else {
        console.error('❌ Migration fehlgeschlagen');
        process.exit(1);
      }
    });
}





