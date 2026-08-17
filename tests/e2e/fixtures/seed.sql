-- Synthetic world_data fixture.
-- seed=42, 30-minute interval, 2026-03-17T21:00:00.000Z .. 2026-03-18T01:00:00.000Z
-- Schema matches the Cloud data-generator table so the same queries work locally and in Cloud.

DROP TABLE IF EXISTS world_data;

CREATE TABLE world_data (
  base_country TEXT,
  birth_rate INTEGER,
  co2 INTEGER,
  gdp INTEGER,
  date_time TIMESTAMP,
  timestamp_value BIGINT
);

INSERT INTO world_data (base_country, birth_rate, co2, gdp, date_time, timestamp_value) VALUES
  ('United States', 12, 5416, 21433, '2026-03-17 21:00:00', 1773781200000),
  ('China',         11, 11680, 14280, '2026-03-17 21:30:00', 1773783000000),
  ('India',         17,  2654,  2870, '2026-03-17 22:00:00', 1773784800000),
  ('Germany',        9,   696,  3845, '2026-03-17 22:30:00', 1773786600000),
  ('Brazil',        14,   466,  1840, '2026-03-17 23:00:00', 1773788400000),
  ('Japan',          7,  1162,  5081, '2026-03-17 23:30:00', 1773790200000),
  ('United Kingdom',11,   351,  2827, '2026-03-18 00:00:00', 1773792000000),
  ('France',        11,   306,  2715, '2026-03-18 00:30:00', 1773793800000),
  ('Canada',        10,   565,  1736, '2026-03-18 01:00:00', 1773795600000);
