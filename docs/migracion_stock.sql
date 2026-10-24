-- Migración: agregar columna stock a la tabla cajas
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- Proyecto: ocibmphnxljicpszaonv

ALTER TABLE cajas ADD COLUMN IF NOT EXISTS stock integer NOT NULL DEFAULT 0;
