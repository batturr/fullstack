# Full-Text Search

**PostgreSQL learning notes (March 2026). Aligned with README topic 22.**

---

## 📑 Table of Contents

- [1. Full-Text Search Basics](#1-full-text-search-basics)
- [2. `tsvector` Type](#2-tsvector-type)
- [3. `tsquery` Type](#3-tsquery-type)
- [4. Text Search Configuration](#4-text-search-configuration)
- [5. FTS Functions (`to_tsvector`, `to_tsquery`, `plainto_tsquery`, `phraseto_tsquery`, `ts_rank`, `ts_rank_cd`)](#5-fts-functions)
- [6. FTS Indexes (GIN)](#6-fts-indexes-gin)
- [7. FTS Queries](#7-fts-queries)
- [8. Search Result Ranking](#8-search-result-ranking)
- [9. Highlighting (`ts_headline`)](#9-highlighting-ts-headline)
- [10. Languages & Dictionaries](#10-languages-dictionaries)
- [11. Full-Text Search Best Practices](#11-fts-best-practices)
- [12. Trigram Search (`pg_trgm`) Fundamentals](#12-trigram-pg-trgm-fundamentals)
- [13. `pg_trgm` Indexes (GiST vs GIN)](#13-pg-trgm-indexes)
- [14. `pg_trgm` Applications](#14-pg-trgm-applications)
- [15. Trigram vs Full-Text Search](#15-trigram-vs-fts)
- [16. Fuzzy Search Fundamentals](#16-fuzzy-search-fundamentals)
- [17. Fuzzy Search with `pg_trgm` & `pgvector`](#17-fuzzy-pg-trgm-pgvector)
- [18. Advanced Fuzzy Patterns, Performance Tuning & Elasticsearch Integration](#18-advanced-fuzzy-elasticsearch)

---

## 1. Full-Text Search Basics

<a id="1-full-text-search-basics"></a>

### Beginner

Full-text search tokenizes documents into lexemes, matches queries with `@@`, and ranks hits using statistics like term frequency. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

Full-text search tokenizes documents into lexemes, matches queries with `@@`, and ranks hits using statistics like term frequency. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

Full-text search tokenizes documents into lexemes, matches queries with `@@`, and ranks hits using statistics like term frequency. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
-- Basic lexeme match
SELECT 'a fat cat sat on a mat & ate a fat rat'::tsvector @@ 'cat & rat'::tsquery AS match;

-- Another quick check with simple config (good for codes/identifiers)
SELECT to_tsvector('simple', 'hello world') @@ to_tsquery('simple', 'hello & world') AS simple_match;

-- Show how stemming can collapse variants (English config)
SELECT to_tsvector('english', 'running runners run') AS stemmed;

-- Negation in tsquery
SELECT to_tsvector('english', 'quick brown fox') @@ to_tsquery('english', 'fox & ! dolphin') AS neg_match;
```


```bash
psql -X -c "SELECT cfgname FROM pg_ts_config;"
```
### Key Points

- FTS is not substring `LIKE` search.
- Language configs matter.
- Indexing changes write/read tradeoffs.

### Best Practices

- Start with `simple` config for identifiers/code-like text.
- Measure ranking needs early.

### Common Mistakes

- Expecting FTS to handle arbitrary regexes without `pg_trgm`/`pgvector`.

#### Hands-On Lab Walkthrough

        1. Create a disposable database for exercises related to “FTS basics”.
2. Install required extensions in the lab before running advanced examples.
3. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
4. Practice safe `SET statement_timeout` when experimenting with heavy queries.
5. Keep a scratchpad of sample documents/events matching your product domain.
6. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.
7. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.
8. Document collation/encoding settings; they affect text search and sorting.
9. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.
10. Pair SQL exercises with application driver tests (params, JSON serialization).
11. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
12. Practice reading `pg_stat_user_indexes` before/after creating indexes.
13. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
14. Archive lab commands into a personal snippet library for interviews.
15. Write a short postmortem template for query regressions you trigger intentionally.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (FTS basics)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT current_database();"
        ```

        #### Discussion & Interview Prompts

        - Where does “FTS basics” show up in `EXPLAIN` plans and system catalogs?
- What are the operational risks during DDL changes while queries depend on this feature?
- How does this feature interact with connection pooling and prepared statements?
- What are the best metrics to monitor when rolling this out broadly?
- How do you validate correctness when migrating from another database engine?
- What are safe rollback strategies if an index or extension causes regressions?
- How do you document data contracts for APIs that surface this SQL behavior?
- What testing pyramid applies: unit SQL fixtures vs integration vs load tests?
- How does this capability behave differently across PostgreSQL major versions you support?
- What is your debugging workflow when results look “almost right” but not identical?

---

## 2. `tsvector` Type

<a id="2-tsvector-type"></a>

### Beginner

`tsvector` stores normalized lexemes with positions/weights suitable for indexed search. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

`tsvector` stores normalized lexemes with positions/weights suitable for indexed search. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

`tsvector` stores normalized lexemes with positions/weights suitable for indexed search. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
SELECT to_tsvector('english', 'running runs runner') AS vec;
SELECT length(to_tsvector('english', 'hello world'));
```


```bash
psql -X -c "SELECT 'a:1 b:2'::tsvector;"
```
### Key Points

- Positions enable phrase/proximity ranking (`ts_rank_cd`).
- Weights A-D mark title/body importance.

### Best Practices

- Precompute `tsvector` in generated columns when stable.
- Reindex after changing configs.

### Common Mistakes

- Assuming unstemmed tokens match user expectations without testing.

#### Hands-On Lab Walkthrough

        1. Install required extensions in the lab before running advanced examples.
2. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
3. Practice safe `SET statement_timeout` when experimenting with heavy queries.
4. Keep a scratchpad of sample documents/events matching your product domain.
5. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.
6. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.
7. Document collation/encoding settings; they affect text search and sorting.
8. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.
9. Pair SQL exercises with application driver tests (params, JSON serialization).
10. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
11. Practice reading `pg_stat_user_indexes` before/after creating indexes.
12. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
13. Archive lab commands into a personal snippet library for interviews.
14. Write a short postmortem template for query regressions you trigger intentionally.
15. Create a disposable database for exercises related to “tsvector”.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (tsvector)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT current_database();"
        ```

        #### Discussion & Interview Prompts

        - Where does “tsvector” show up in `EXPLAIN` plans and system catalogs?
- What are the operational risks during DDL changes while queries depend on this feature?
- How does this feature interact with connection pooling and prepared statements?
- What are the best metrics to monitor when rolling this out broadly?
- How do you validate correctness when migrating from another database engine?
- What are safe rollback strategies if an index or extension causes regressions?
- How do you document data contracts for APIs that surface this SQL behavior?
- What testing pyramid applies: unit SQL fixtures vs integration vs load tests?
- How does this capability behave differently across PostgreSQL major versions you support?
- What is your debugging workflow when results look “almost right” but not identical?

---

## 3. `tsquery` Type

<a id="3-tsquery-type"></a>

### Beginner

`tsquery` encodes boolean/phrase search using `&`, `|`, `!`, `<->` operators. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

`tsquery` encodes boolean/phrase search using `&`, `|`, `!`, `<->` operators. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

`tsquery` encodes boolean/phrase search using `&`, `|`, `!`, `<->` operators. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
SELECT to_tsquery('english', 'fat & rat') AS q;
SELECT phraseto_tsquery('english', 'fat rats');
```


```bash
psql -X -c "SELECT 'a & !b'::tsquery;"
```
### Key Points

- Phrase queries differ from AND of tokens.
- Parsing depends on config/dictionaries.

### Best Practices

- Use `plainto_tsquery` for untrusted user input patterns when appropriate.
- Validate user query length.

### Common Mistakes

- Feeding raw user text to `to_tsquery` without understanding parse errors.

#### Hands-On Lab Walkthrough

        1. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
2. Practice safe `SET statement_timeout` when experimenting with heavy queries.
3. Keep a scratchpad of sample documents/events matching your product domain.
4. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.
5. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.
6. Document collation/encoding settings; they affect text search and sorting.
7. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.
8. Pair SQL exercises with application driver tests (params, JSON serialization).
9. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
10. Practice reading `pg_stat_user_indexes` before/after creating indexes.
11. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
12. Archive lab commands into a personal snippet library for interviews.
13. Write a short postmortem template for query regressions you trigger intentionally.
14. Create a disposable database for exercises related to “tsquery”.
15. Install required extensions in the lab before running advanced examples.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (tsquery)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT current_database();"
        ```

        #### Discussion & Interview Prompts

        - Where does “tsquery” show up in `EXPLAIN` plans and system catalogs?
- What are the operational risks during DDL changes while queries depend on this feature?
- How does this feature interact with connection pooling and prepared statements?
- What are the best metrics to monitor when rolling this out broadly?
- How do you validate correctness when migrating from another database engine?
- What are safe rollback strategies if an index or extension causes regressions?
- How do you document data contracts for APIs that surface this SQL behavior?
- What testing pyramid applies: unit SQL fixtures vs integration vs load tests?
- How does this capability behave differently across PostgreSQL major versions you support?
- What is your debugging workflow when results look “almost right” but not identical?

---

## 4. Text Search Configuration

<a id="4-text-search-configuration"></a>

### Beginner

Configurations bundle parsers, dictionaries (stemming/synonyms), and stopword handling. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

Configurations bundle parsers, dictionaries (stemming/synonyms), and stopword handling. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

Configurations bundle parsers, dictionaries (stemming/synonyms), and stopword handling. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
SELECT cfgname, cfgnamespace::regnamespace FROM pg_ts_config;
SHOW default_text_search_config;
```


```bash
psql -X -c "SELECT * FROM pg_ts_config_map LIMIT 5;"
```
### Key Points

- Pick config per column/domain (legal vs tweets).
- Custom dictionaries are powerful but operational overhead.

### Best Practices

- Document config choice in schema comments.
- Test stemming surprises ('university'→'univers').

### Common Mistakes

- Mixing configs between index and query.

#### Hands-On Lab Walkthrough

        1. Practice safe `SET statement_timeout` when experimenting with heavy queries.
2. Keep a scratchpad of sample documents/events matching your product domain.
3. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.
4. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.
5. Document collation/encoding settings; they affect text search and sorting.
6. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.
7. Pair SQL exercises with application driver tests (params, JSON serialization).
8. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
9. Practice reading `pg_stat_user_indexes` before/after creating indexes.
10. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
11. Archive lab commands into a personal snippet library for interviews.
12. Write a short postmortem template for query regressions you trigger intentionally.
13. Create a disposable database for exercises related to “text search config”.
14. Install required extensions in the lab before running advanced examples.
15. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (text search config)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT current_database();"
        ```

        #### Discussion & Interview Prompts

        - Where does “text search config” show up in `EXPLAIN` plans and system catalogs?
- What are the operational risks during DDL changes while queries depend on this feature?
- How does this feature interact with connection pooling and prepared statements?
- What are the best metrics to monitor when rolling this out broadly?
- How do you validate correctness when migrating from another database engine?
- What are safe rollback strategies if an index or extension causes regressions?
- How do you document data contracts for APIs that surface this SQL behavior?
- What testing pyramid applies: unit SQL fixtures vs integration vs load tests?
- How does this capability behave differently across PostgreSQL major versions you support?
- What is your debugging workflow when results look “almost right” but not identical?

---

## 5. FTS Functions (`to_tsvector`, `to_tsquery`, `plainto_tsquery`, `phraseto_tsquery`, `ts_rank`, `ts_rank_cd`)

<a id="5-fts-functions"></a>

### Beginner

Core functions convert text to `tsvector`/`tsquery` and score matches; `ts_rank_cd` considers proximity. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

Core functions convert text to `tsvector`/`tsquery` and score matches; `ts_rank_cd` considers proximity. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

Core functions convert text to `tsvector`/`tsquery` and score matches; `ts_rank_cd` considers proximity. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
SELECT ts_rank(to_tsvector('english', 'quick brown fox'),
              plainto_tsquery('english', 'fox')) AS r;
```


```bash
psql -X -c "SELECT ts_headline('english', 'the fox', plainto_tsquery('english','fox'));"
```
### Key Points

- `ts_rank` family is sensitive to document length normalization flags.
- Phrase ranking needs phrase queries.

### Best Practices

- Wrap in SQL functions marked IMMUTABLE only when inputs are.
- Cache expensive vectors.

### Common Mistakes

- Using ranking without `EXPLAIN ANALYZE` on realistic volumes.

#### Hands-On Lab Walkthrough

        1. Keep a scratchpad of sample documents/events matching your product domain.
2. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.
3. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.
4. Document collation/encoding settings; they affect text search and sorting.
5. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.
6. Pair SQL exercises with application driver tests (params, JSON serialization).
7. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
8. Practice reading `pg_stat_user_indexes` before/after creating indexes.
9. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
10. Archive lab commands into a personal snippet library for interviews.
11. Write a short postmortem template for query regressions you trigger intentionally.
12. Create a disposable database for exercises related to “FTS functions”.
13. Install required extensions in the lab before running advanced examples.
14. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
15. Practice safe `SET statement_timeout` when experimenting with heavy queries.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (FTS functions)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT current_database();"
        ```

        #### Discussion & Interview Prompts

        - Where does “FTS functions” show up in `EXPLAIN` plans and system catalogs?
- What are the operational risks during DDL changes while queries depend on this feature?
- How does this feature interact with connection pooling and prepared statements?
- What are the best metrics to monitor when rolling this out broadly?
- How do you validate correctness when migrating from another database engine?
- What are safe rollback strategies if an index or extension causes regressions?
- How do you document data contracts for APIs that surface this SQL behavior?
- What testing pyramid applies: unit SQL fixtures vs integration vs load tests?
- How does this capability behave differently across PostgreSQL major versions you support?
- What is your debugging workflow when results look “almost right” but not identical?

---

## 6. FTS Indexes (GIN)

<a id="6-fts-indexes-gin"></a>

### Beginner

GIN is the default index access for `tsvector`; GiST possible but less common today. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

GIN is the default index access for `tsvector`; GiST possible but less common today. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

GIN is the default index access for `tsvector`; GiST possible but less common today. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
CREATE TABLE IF NOT EXISTS docs (id serial PRIMARY KEY, t text);
CREATE INDEX IF NOT EXISTS docs_tsv ON docs USING gin (to_tsvector('english', t));
```


```bash
psql -X -c "\d docs"
```
### Key Points

- Expression index must match query expression exactly.
- GIN indexes are write-heavy.

### Best Practices

- Consider `jsonb`/`tsvector` multicolumn patterns via generated columns.
- Partial indexes for published-only rows.

### Common Mistakes

- Indexing `to_tsvector('english', col)` but querying different config.

#### Hands-On Lab Walkthrough

        1. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.
2. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.
3. Document collation/encoding settings; they affect text search and sorting.
4. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.
5. Pair SQL exercises with application driver tests (params, JSON serialization).
6. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
7. Practice reading `pg_stat_user_indexes` before/after creating indexes.
8. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
9. Archive lab commands into a personal snippet library for interviews.
10. Write a short postmortem template for query regressions you trigger intentionally.
11. Create a disposable database for exercises related to “FTS GIN”.
12. Install required extensions in the lab before running advanced examples.
13. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
14. Practice safe `SET statement_timeout` when experimenting with heavy queries.
15. Keep a scratchpad of sample documents/events matching your product domain.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (FTS GIN)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT current_database();"
        ```

        #### Discussion & Interview Prompts

        - Where does “FTS GIN” show up in `EXPLAIN` plans and system catalogs?
- What are the operational risks during DDL changes while queries depend on this feature?
- How does this feature interact with connection pooling and prepared statements?
- What are the best metrics to monitor when rolling this out broadly?
- How do you validate correctness when migrating from another database engine?
- What are safe rollback strategies if an index or extension causes regressions?
- How do you document data contracts for APIs that surface this SQL behavior?
- What testing pyramid applies: unit SQL fixtures vs integration vs load tests?
- How does this capability behave differently across PostgreSQL major versions you support?
- What is your debugging workflow when results look “almost right” but not identical?

---

## 7. FTS Queries

<a id="7-fts-queries"></a>

### Beginner

Combine boolean logic, phrase search, and weights; debug with `EXPLAIN` to ensure bitmap/GIN paths. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

Combine boolean logic, phrase search, and weights; debug with `EXPLAIN` to ensure bitmap/GIN paths. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

Combine boolean logic, phrase search, and weights; debug with `EXPLAIN` to ensure bitmap/GIN paths. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
SELECT * FROM docs WHERE to_tsvector('english', t) @@ websearch_to_tsquery('english', 'quick fox');
```


```bash
psql -X -c "SELECT websearch_to_tsquery('english', '"fat rat" OR cat');"
```
### Key Points

- `websearch_to_tsquery` helps web-style input on modern versions.
- Sanitize and bound user queries.

### Best Practices

- Log slow FTS queries with `auto_explain`.
- Use `LIMIT` early for interactive search.

### Common Mistakes

- OR-heavy queries exploding bitmap scans without caps.

#### Hands-On Lab Walkthrough

        1. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.
2. Document collation/encoding settings; they affect text search and sorting.
3. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.
4. Pair SQL exercises with application driver tests (params, JSON serialization).
5. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
6. Practice reading `pg_stat_user_indexes` before/after creating indexes.
7. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
8. Archive lab commands into a personal snippet library for interviews.
9. Write a short postmortem template for query regressions you trigger intentionally.
10. Create a disposable database for exercises related to “FTS queries”.
11. Install required extensions in the lab before running advanced examples.
12. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
13. Practice safe `SET statement_timeout` when experimenting with heavy queries.
14. Keep a scratchpad of sample documents/events matching your product domain.
15. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (FTS queries)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT current_database();"
        ```

        #### Discussion & Interview Prompts

        - Where does “FTS queries” show up in `EXPLAIN` plans and system catalogs?
- What are the operational risks during DDL changes while queries depend on this feature?
- How does this feature interact with connection pooling and prepared statements?
- What are the best metrics to monitor when rolling this out broadly?
- How do you validate correctness when migrating from another database engine?
- What are safe rollback strategies if an index or extension causes regressions?
- How do you document data contracts for APIs that surface this SQL behavior?
- What testing pyramid applies: unit SQL fixtures vs integration vs load tests?
- How does this capability behave differently across PostgreSQL major versions you support?
- What is your debugging workflow when results look “almost right” but not identical?

---

## 8. Search Result Ranking

<a id="8-search-result-ranking"></a>

### Beginner

Tune ranking normalization flags and consider boosting title fields via weights. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

Tune ranking normalization flags and consider boosting title fields via weights. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

Tune ranking normalization flags and consider boosting title fields via weights. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
SELECT ts_rank_cd(setweight(to_tsvector('english','title text'),'A') ||
                  setweight(to_tsvector('english','body text'),'B'),
                  query) AS score
FROM plainto_tsquery('english','title') query;
```


```bash
psql -X -c "SELECT ts_rank_cd(to_tsvector('simple','a b'), 'a'::tsquery, 32);"
```
### Key Points

- Ranking is heuristic—validate with human judgments.
- A/B test ranking changes.

### Best Practices

- Materialize scores in application layer when mixing signals.
- Combine with recency boosts carefully.

### Common Mistakes

- Overfitting ranking to a tiny evaluation set.

#### Hands-On Lab Walkthrough

        1. Document collation/encoding settings; they affect text search and sorting.
2. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.
3. Pair SQL exercises with application driver tests (params, JSON serialization).
4. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
5. Practice reading `pg_stat_user_indexes` before/after creating indexes.
6. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
7. Archive lab commands into a personal snippet library for interviews.
8. Write a short postmortem template for query regressions you trigger intentionally.
9. Create a disposable database for exercises related to “FTS ranking”.
10. Install required extensions in the lab before running advanced examples.
11. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
12. Practice safe `SET statement_timeout` when experimenting with heavy queries.
13. Keep a scratchpad of sample documents/events matching your product domain.
14. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.
15. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (FTS ranking)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT current_database();"
        ```

        #### Discussion & Interview Prompts

        - Where does “FTS ranking” show up in `EXPLAIN` plans and system catalogs?
- What are the operational risks during DDL changes while queries depend on this feature?
- How does this feature interact with connection pooling and prepared statements?
- What are the best metrics to monitor when rolling this out broadly?
- How do you validate correctness when migrating from another database engine?
- What are safe rollback strategies if an index or extension causes regressions?
- How do you document data contracts for APIs that surface this SQL behavior?
- What testing pyramid applies: unit SQL fixtures vs integration vs load tests?
- How does this capability behave differently across PostgreSQL major versions you support?
- What is your debugging workflow when results look “almost right” but not identical?

---

## 9. Highlighting (`ts_headline`)

<a id="9-highlighting-ts-headline"></a>

### Beginner

`ts_headline` builds snippets around hits for UI display with configurable tags. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

`ts_headline` builds snippets around hits for UI display with configurable tags. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

`ts_headline` builds snippets around hits for UI display with configurable tags. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
SELECT ts_headline('english',
  'The fat cats ate the fat rats on the fat mat',
  phraseto_tsquery('english','fat rat'),
  'StartSel=>>, StopSel=<<, MaxWords=10, MinWords=3');
```


```bash
psql -X -c "SELECT ts_headline('simple','abc def ghi','def'::tsquery);"
```
### Key Points

- Highlighting is CPU-heavy on large texts.
- Cap input size for UX endpoints.

### Best Practices

- Use different options for HTML vs plain text to avoid XSS.
- Cache snippets for repeated queries.

### Common Mistakes

- Injecting unsanitized HTML around highlights.

#### Hands-On Lab Walkthrough

        1. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.
2. Pair SQL exercises with application driver tests (params, JSON serialization).
3. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
4. Practice reading `pg_stat_user_indexes` before/after creating indexes.
5. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
6. Archive lab commands into a personal snippet library for interviews.
7. Write a short postmortem template for query regressions you trigger intentionally.
8. Create a disposable database for exercises related to “ts_headline”.
9. Install required extensions in the lab before running advanced examples.
10. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
11. Practice safe `SET statement_timeout` when experimenting with heavy queries.
12. Keep a scratchpad of sample documents/events matching your product domain.
13. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.
14. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.
15. Document collation/encoding settings; they affect text search and sorting.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (ts_headline)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT current_database();"
        ```

        #### Discussion & Interview Prompts

        - Where does “ts_headline” show up in `EXPLAIN` plans and system catalogs?
- What are the operational risks during DDL changes while queries depend on this feature?
- How does this feature interact with connection pooling and prepared statements?
- What are the best metrics to monitor when rolling this out broadly?
- How do you validate correctness when migrating from another database engine?
- What are safe rollback strategies if an index or extension causes regressions?
- How do you document data contracts for APIs that surface this SQL behavior?
- What testing pyramid applies: unit SQL fixtures vs integration vs load tests?
- How does this capability behave differently across PostgreSQL major versions you support?
- What is your debugging workflow when results look “almost right” but not identical?

---

## 10. Languages & Dictionaries

<a id="10-languages-dictionaries"></a>

### Beginner

Snowball dictionaries stem words; thesaurus/synonym maps expand queries; stopwords remove noise. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

Snowball dictionaries stem words; thesaurus/synonym maps expand queries; stopwords remove noise. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

Snowball dictionaries stem words; thesaurus/synonym maps expand queries; stopwords remove noise. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
SELECT * FROM pg_ts_dict WHERE dictname LIKE 'english%';
```


```bash
psql -X -c "SELECT ts_lexize('english_stem', 'running');"
```
### Key Points

- Custom dictionaries require maintenance workflows.
- Multi-language often means multiple columns/indexes.

### Best Practices

- Ship dictionary updates with migration notes.
- Test proper nouns and brand names.

### Common Mistakes

- Assuming one global config fits all tenants/locales.

#### Hands-On Lab Walkthrough

        1. Pair SQL exercises with application driver tests (params, JSON serialization).
2. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
3. Practice reading `pg_stat_user_indexes` before/after creating indexes.
4. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
5. Archive lab commands into a personal snippet library for interviews.
6. Write a short postmortem template for query regressions you trigger intentionally.
7. Create a disposable database for exercises related to “dictionaries”.
8. Install required extensions in the lab before running advanced examples.
9. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
10. Practice safe `SET statement_timeout` when experimenting with heavy queries.
11. Keep a scratchpad of sample documents/events matching your product domain.
12. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.
13. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.
14. Document collation/encoding settings; they affect text search and sorting.
15. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (dictionaries)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT current_database();"
        ```

        #### Discussion & Interview Prompts

        - Where does “dictionaries” show up in `EXPLAIN` plans and system catalogs?
- What are the operational risks during DDL changes while queries depend on this feature?
- How does this feature interact with connection pooling and prepared statements?
- What are the best metrics to monitor when rolling this out broadly?
- How do you validate correctness when migrating from another database engine?
- What are safe rollback strategies if an index or extension causes regressions?
- How do you document data contracts for APIs that surface this SQL behavior?
- What testing pyramid applies: unit SQL fixtures vs integration vs load tests?
- How does this capability behave differently across PostgreSQL major versions you support?
- What is your debugging workflow when results look “almost right” but not identical?

---

## 11. Full-Text Search Best Practices

<a id="11-fts-best-practices"></a>

### Beginner

Normalize documents, precompute vectors, index selectively, monitor bloat, and test ranking with real queries. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

Normalize documents, precompute vectors, index selectively, monitor bloat, and test ranking with real queries. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

Normalize documents, precompute vectors, index selectively, monitor bloat, and test ranking with real queries. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
SELECT relname, idx_scan FROM pg_stat_user_indexes WHERE indexrelname LIKE '%gin%';

-- Inspect tokenizer output for debugging configs (lab only; can be verbose)
SELECT * FROM ts_debug('english', 'The PostgreSQL FTS chapter: running queries & ranking.');

-- Compare plain vs phrase query parsing side-by-side
SELECT plainto_tsquery('english', 'fat rat') AS plain_q,
       phraseto_tsquery('english', 'fat rat') AS phrase_q;

SELECT to_tsquery('english', 'fat <-> rat') AS adjacency_query;
-- End of supplemental FTS diagnostics for this subtopic
```


```bash
psql -X -c "REINDEX INDEX CONCURRENTLY docs_tsv;"
```
### Key Points

- FTS is part of a broader search strategy.
- Combine with trigram for fuzzy needs.

### Best Practices

- Track index hit rates and query latency SLAs.
- Plan reindex windows for heavy write tables.

### Common Mistakes

- Ignoring vacuum/autovacuum on heavily updated GIN tables.

#### Hands-On Lab Walkthrough

        1. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
2. Practice reading `pg_stat_user_indexes` before/after creating indexes.
3. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
4. Archive lab commands into a personal snippet library for interviews.
5. Write a short postmortem template for query regressions you trigger intentionally.
6. Create a disposable database for exercises related to “FTS practices”.
7. Install required extensions in the lab before running advanced examples.
8. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
9. Practice safe `SET statement_timeout` when experimenting with heavy queries.
10. Keep a scratchpad of sample documents/events matching your product domain.
11. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.
12. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.
13. Document collation/encoding settings; they affect text search and sorting.
14. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.
15. Pair SQL exercises with application driver tests (params, JSON serialization).

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (FTS practices)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT current_database();"
        ```

        #### Discussion & Interview Prompts

        - Where does “FTS practices” show up in `EXPLAIN` plans and system catalogs?
- What are the operational risks during DDL changes while queries depend on this feature?
- How does this feature interact with connection pooling and prepared statements?
- What are the best metrics to monitor when rolling this out broadly?
- How do you validate correctness when migrating from another database engine?
- What are safe rollback strategies if an index or extension causes regressions?
- How do you document data contracts for APIs that surface this SQL behavior?
- What testing pyramid applies: unit SQL fixtures vs integration vs load tests?
- How does this capability behave differently across PostgreSQL major versions you support?
- What is your debugging workflow when results look “almost right” but not identical?

---

## 12. Trigram Search (`pg_trgm`) Fundamentals

<a id="12-trigram-pg-trgm-fundamentals"></a>

### Beginner

Trigrams slice strings into length-3 fragments for similarity and `LIKE` acceleration. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

Trigrams slice strings into length-3 fragments for similarity and `LIKE` acceleration. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

Trigrams slice strings into length-3 fragments for similarity and `LIKE` acceleration. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
SELECT similarity('PostgreSQL','PostgresQL'), 'foo' % 'fooo';
```


```bash
psql -X -c "SHOW pg_trgm.similarity_threshold;"
```
### Key Points

- `%` uses similarity threshold settings.
- Great for typos, names, paths.

### Best Practices

- Calibrate thresholds on representative datasets.
- Combine with `LIMIT` to control cost.

### Common Mistakes

- Using defaults without measuring precision/recall.

#### Hands-On Lab Walkthrough

        1. Practice reading `pg_stat_user_indexes` before/after creating indexes.
2. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
3. Archive lab commands into a personal snippet library for interviews.
4. Write a short postmortem template for query regressions you trigger intentionally.
5. Create a disposable database for exercises related to “pg_trgm basics”.
6. Install required extensions in the lab before running advanced examples.
7. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
8. Practice safe `SET statement_timeout` when experimenting with heavy queries.
9. Keep a scratchpad of sample documents/events matching your product domain.
10. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.
11. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.
12. Document collation/encoding settings; they affect text search and sorting.
13. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.
14. Pair SQL exercises with application driver tests (params, JSON serialization).
15. Time queries at realistic concurrency using `pgbench` custom scripts when possible.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (pg_trgm basics)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT current_database();"
        ```

        #### Discussion & Interview Prompts

        - Where does “pg_trgm basics” show up in `EXPLAIN` plans and system catalogs?
- What are the operational risks during DDL changes while queries depend on this feature?
- How does this feature interact with connection pooling and prepared statements?
- What are the best metrics to monitor when rolling this out broadly?
- How do you validate correctness when migrating from another database engine?
- What are safe rollback strategies if an index or extension causes regressions?
- How do you document data contracts for APIs that surface this SQL behavior?
- What testing pyramid applies: unit SQL fixtures vs integration vs load tests?
- How does this capability behave differently across PostgreSQL major versions you support?
- What is your debugging workflow when results look “almost right” but not identical?

---

## 13. `pg_trgm` Indexes (GiST vs GIN)

<a id="13-pg-trgm-indexes"></a>

### Beginner

GiST supports distance operators; GIN supports `LIKE`/`similarity` workloads differently—benchmark both. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

GiST supports distance operators; GIN supports `LIKE`/`similarity` workloads differently—benchmark both. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

GiST supports distance operators; GIN supports `LIKE`/`similarity` workloads differently—benchmark both. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
CREATE INDEX IF NOT EXISTS trgm_idx ON docs USING gin (t gin_trgm_ops);
```


```bash
psql -X -c "EXPLAIN SELECT * FROM docs WHERE t LIKE '%foo%';"
```
### Key Points

- Trigram indexes can be large.
- Write amplification on narrow tables may be acceptable.

### Best Practices

- Use `pg_stat_user_indexes` to confirm usage.
- Lower `pg_trgm` thresholds only with indexes.

### Common Mistakes

- Indexing varchar(5000) columns without considering index size.

#### Hands-On Lab Walkthrough

        1. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
2. Archive lab commands into a personal snippet library for interviews.
3. Write a short postmortem template for query regressions you trigger intentionally.
4. Create a disposable database for exercises related to “pg_trgm indexes”.
5. Install required extensions in the lab before running advanced examples.
6. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
7. Practice safe `SET statement_timeout` when experimenting with heavy queries.
8. Keep a scratchpad of sample documents/events matching your product domain.
9. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.
10. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.
11. Document collation/encoding settings; they affect text search and sorting.
12. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.
13. Pair SQL exercises with application driver tests (params, JSON serialization).
14. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
15. Practice reading `pg_stat_user_indexes` before/after creating indexes.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (pg_trgm indexes)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT current_database();"
        ```

        #### Discussion & Interview Prompts

        - Where does “pg_trgm indexes” show up in `EXPLAIN` plans and system catalogs?
- What are the operational risks during DDL changes while queries depend on this feature?
- How does this feature interact with connection pooling and prepared statements?
- What are the best metrics to monitor when rolling this out broadly?
- How do you validate correctness when migrating from another database engine?
- What are safe rollback strategies if an index or extension causes regressions?
- How do you document data contracts for APIs that surface this SQL behavior?
- What testing pyramid applies: unit SQL fixtures vs integration vs load tests?
- How does this capability behave differently across PostgreSQL major versions you support?
- What is your debugging workflow when results look “almost right” but not identical?

---

## 14. `pg_trgm` Applications

<a id="14-pg-trgm-applications"></a>

### Beginner

Use trigrams for deduplication, autocomplete, address matching, and fuzzy joins. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

Use trigrams for deduplication, autocomplete, address matching, and fuzzy joins. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

Use trigrams for deduplication, autocomplete, address matching, and fuzzy joins. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
SELECT a.id, b.id, similarity(a.t, b.t)
FROM docs a JOIN docs b ON a.id < b.id AND a.t % b.t;
```


```bash
psql -X -c "SELECT show_trgm('abc');"
```
### Key Points

- Self-joins explode cardinality—pre-filter.
- Consider blocking keys for entity resolution.

### Best Practices

- Materialized candidate pairs for nightly jobs.
- Log false positives to tune thresholds.

### Common Mistakes

- Running fuzzy joins cartesianly on large tables.

#### Hands-On Lab Walkthrough

        1. Archive lab commands into a personal snippet library for interviews.
2. Write a short postmortem template for query regressions you trigger intentionally.
3. Create a disposable database for exercises related to “pg_trgm apps”.
4. Install required extensions in the lab before running advanced examples.
5. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
6. Practice safe `SET statement_timeout` when experimenting with heavy queries.
7. Keep a scratchpad of sample documents/events matching your product domain.
8. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.
9. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.
10. Document collation/encoding settings; they affect text search and sorting.
11. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.
12. Pair SQL exercises with application driver tests (params, JSON serialization).
13. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
14. Practice reading `pg_stat_user_indexes` before/after creating indexes.
15. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (pg_trgm apps)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT current_database();"
        ```

        #### Discussion & Interview Prompts

        - Where does “pg_trgm apps” show up in `EXPLAIN` plans and system catalogs?
- What are the operational risks during DDL changes while queries depend on this feature?
- How does this feature interact with connection pooling and prepared statements?
- What are the best metrics to monitor when rolling this out broadly?
- How do you validate correctness when migrating from another database engine?
- What are safe rollback strategies if an index or extension causes regressions?
- How do you document data contracts for APIs that surface this SQL behavior?
- What testing pyramid applies: unit SQL fixtures vs integration vs load tests?
- How does this capability behave differently across PostgreSQL major versions you support?
- What is your debugging workflow when results look “almost right” but not identical?

---

## 15. Trigram vs Full-Text Search

<a id="15-trigram-vs-fts"></a>

### Beginner

FTS matches linguistic tokens; trigrams match character similarity—complementary, not interchangeable. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

FTS matches linguistic tokens; trigrams match character similarity—complementary, not interchangeable. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

FTS matches linguistic tokens; trigrams match character similarity—complementary, not interchangeable. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
SELECT to_tsvector('english','running') @@ to_tsquery('english','run');
SELECT similarity('running','run');
```


```bash
psql -X -c "SELECT 'running' ILIKE '%run%';"
```
### Key Points

- Hybrid search pipelines are common in production.
- Route queries by mode (keyword vs fuzzy).

### Best Practices

- Document when to fall back from FTS to trigram.
- Test cross-language behavior.

### Common Mistakes

- Using trigram alone for large document relevance ranking.

#### Hands-On Lab Walkthrough

        1. Write a short postmortem template for query regressions you trigger intentionally.
2. Create a disposable database for exercises related to “trigram vs FTS”.
3. Install required extensions in the lab before running advanced examples.
4. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
5. Practice safe `SET statement_timeout` when experimenting with heavy queries.
6. Keep a scratchpad of sample documents/events matching your product domain.
7. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.
8. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.
9. Document collation/encoding settings; they affect text search and sorting.
10. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.
11. Pair SQL exercises with application driver tests (params, JSON serialization).
12. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
13. Practice reading `pg_stat_user_indexes` before/after creating indexes.
14. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
15. Archive lab commands into a personal snippet library for interviews.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (trigram vs FTS)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT current_database();"
        ```

        #### Discussion & Interview Prompts

        - Where does “trigram vs FTS” show up in `EXPLAIN` plans and system catalogs?
- What are the operational risks during DDL changes while queries depend on this feature?
- How does this feature interact with connection pooling and prepared statements?
- What are the best metrics to monitor when rolling this out broadly?
- How do you validate correctness when migrating from another database engine?
- What are safe rollback strategies if an index or extension causes regressions?
- How do you document data contracts for APIs that surface this SQL behavior?
- What testing pyramid applies: unit SQL fixtures vs integration vs load tests?
- How does this capability behave differently across PostgreSQL major versions you support?
- What is your debugging workflow when results look “almost right” but not identical?

---

## 16. Fuzzy Search Fundamentals

<a id="16-fuzzy-search-fundamentals"></a>

### Beginner

Fuzzy matching tolerates typos via similarity metrics, edit distances, phonetic algorithms, or embeddings. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

Fuzzy matching tolerates typos via similarity metrics, edit distances, phonetic algorithms, or embeddings. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

Fuzzy matching tolerates typos via similarity metrics, edit distances, phonetic algorithms, or embeddings. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
SELECT levenshtein('kitten','sitting'), soundex('Robert'), soundex('Rupert');
```


```bash
psql -X -c "SELECT metaphone('PostgreSQL',8);"
```
### Key Points

- Choose metrics based on domain (names vs SKUs).
- Understand O(n*m) costs for Levenshtein.

### Best Practices

- Pre-filter candidates to keep fuzzy functions cheap.
- Establish human review for borderline scores.

### Common Mistakes

- Applying phonetic matching to non-Latin scripts without validation.

#### Hands-On Lab Walkthrough

        1. Create a disposable database for exercises related to “fuzzy search”.
2. Install required extensions in the lab before running advanced examples.
3. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
4. Practice safe `SET statement_timeout` when experimenting with heavy queries.
5. Keep a scratchpad of sample documents/events matching your product domain.
6. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.
7. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.
8. Document collation/encoding settings; they affect text search and sorting.
9. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.
10. Pair SQL exercises with application driver tests (params, JSON serialization).
11. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
12. Practice reading `pg_stat_user_indexes` before/after creating indexes.
13. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
14. Archive lab commands into a personal snippet library for interviews.
15. Write a short postmortem template for query regressions you trigger intentionally.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (fuzzy search)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT current_database();"
        ```

        #### Discussion & Interview Prompts

        - Where does “fuzzy search” show up in `EXPLAIN` plans and system catalogs?
- What are the operational risks during DDL changes while queries depend on this feature?
- How does this feature interact with connection pooling and prepared statements?
- What are the best metrics to monitor when rolling this out broadly?
- How do you validate correctness when migrating from another database engine?
- What are safe rollback strategies if an index or extension causes regressions?
- How do you document data contracts for APIs that surface this SQL behavior?
- What testing pyramid applies: unit SQL fixtures vs integration vs load tests?
- How does this capability behave differently across PostgreSQL major versions you support?
- What is your debugging workflow when results look “almost right” but not identical?

---

## 17. Fuzzy Search with `pg_trgm` & `pgvector`

<a id="17-fuzzy-pg-trgm-pgvector"></a>

### Beginner

`pg_trgm` handles character-level fuzziness; `pgvector` supports semantic similarity over embeddings with ANN indexes. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

`pg_trgm` handles character-level fuzziness; `pgvector` supports semantic similarity over embeddings with ANN indexes. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

`pg_trgm` handles character-level fuzziness; `pgvector` supports semantic similarity over embeddings with ANN indexes. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
-- pgvector example (requires extension)
CREATE EXTENSION IF NOT EXISTS vector;
SELECT '[1,2,3]'::vector <=> '[1,2,4]'::vector AS cosine_distance;
```


```bash
psql -X -c "SELECT extname FROM pg_extension WHERE extname IN ('vector','pg_trgm');"
```
### Key Points

- Embeddings shift maintenance to model lifecycle.
- Hybrid lexical+vector rerank is a strong pattern.

### Best Practices

- Normalize vectors consistently; track model version per column.
- Use HNSW/IVFFlat per workload guidance.

### Common Mistakes

- Treating embedding distance as business truth without calibration.

#### Hands-On Lab Walkthrough

        1. Install required extensions in the lab before running advanced examples.
2. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
3. Practice safe `SET statement_timeout` when experimenting with heavy queries.
4. Keep a scratchpad of sample documents/events matching your product domain.
5. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.
6. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.
7. Document collation/encoding settings; they affect text search and sorting.
8. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.
9. Pair SQL exercises with application driver tests (params, JSON serialization).
10. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
11. Practice reading `pg_stat_user_indexes` before/after creating indexes.
12. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
13. Archive lab commands into a personal snippet library for interviews.
14. Write a short postmortem template for query regressions you trigger intentionally.
15. Create a disposable database for exercises related to “pg_trgm + pgvector”.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (pg_trgm + pgvector)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT current_database();"
        ```

        #### Discussion & Interview Prompts

        - Where does “pg_trgm + pgvector” show up in `EXPLAIN` plans and system catalogs?
- What are the operational risks during DDL changes while queries depend on this feature?
- How does this feature interact with connection pooling and prepared statements?
- What are the best metrics to monitor when rolling this out broadly?
- How do you validate correctness when migrating from another database engine?
- What are safe rollback strategies if an index or extension causes regressions?
- How do you document data contracts for APIs that surface this SQL behavior?
- What testing pyramid applies: unit SQL fixtures vs integration vs load tests?
- How does this capability behave differently across PostgreSQL major versions you support?
- What is your debugging workflow when results look “almost right” but not identical?

---

## 18. Advanced Fuzzy Patterns, Performance Tuning & Elasticsearch Integration

<a id="18-advanced-fuzzy-elasticsearch"></a>

### Beginner

Combine SQL filters with batch fuzzy jobs; for large-scale inverted indexes and analyzers, many teams dual-write to Elasticsearch/OpenSearch with CDC. Start with literals, casts, and simple predicates before adding indexes or complex functions.

### Intermediate

Combine SQL filters with batch fuzzy jobs; for large-scale inverted indexes and analyzers, many teams dual-write to Elasticsearch/OpenSearch with CDC. Next, connect storage, statistics, and `EXPLAIN` plans; add constraints and monitoring suitable for production rollouts.

### Expert

Combine SQL filters with batch fuzzy jobs; for large-scale inverted indexes and analyzers, many teams dual-write to Elasticsearch/OpenSearch with CDC. At depth, study catalog representations, concurrency, parallel query, and interactions with replication and backups.


```sql
WITH candidates AS (
  SELECT id, t FROM docs WHERE t ILIKE 'foo%' LIMIT 1000
)
SELECT id, t, similarity(t,'foobarbaz') AS s FROM candidates ORDER BY s DESC LIMIT 10;
```


```bash
# Elasticsearch is out-of-process; typical pattern: Debezium/Kafka/logical decoding → indexer
curl -s http://localhost:9200/_cluster/health?pretty
```
### Key Points

- External search engines excel at analyzers, sharding, and relevance experimentation.
- CDC introduces lag—design UX accordingly.

### Best Practices

- Keep PostgreSQL authoritative for transactions; index derived documents.
- Monitor dual-write failures with dead-letter queues.

### Common Mistakes

- Letting search index drift silently without reconciliation jobs.

#### Hands-On Lab Walkthrough

        1. Capture `EXPLAIN (ANALYZE, BUFFERS)` baselines for before/after index changes.
2. Practice safe `SET statement_timeout` when experimenting with heavy queries.
3. Keep a scratchpad of sample documents/events matching your product domain.
4. Re-run examples after `VACUUM ANALYZE` to avoid stale planner estimates.
5. Compare plans with `enable_seqscan=off` only in labs to learn index usage—not in prod.
6. Document collation/encoding settings; they affect text search and sorting.
7. Build a mini dataset with edge cases: NULLs, unicode, nested structures, duplicates.
8. Pair SQL exercises with application driver tests (params, JSON serialization).
9. Time queries at realistic concurrency using `pgbench` custom scripts when possible.
10. Practice reading `pg_stat_user_indexes` before/after creating indexes.
11. For replication-heavy shops, rehearse how JSON/FTS workloads affect WAL volume.
12. Archive lab commands into a personal snippet library for interviews.
13. Write a short postmortem template for query regressions you trigger intentionally.
14. Create a disposable database for exercises related to “fuzzy + ES”.
15. Install required extensions in the lab before running advanced examples.

        #### Supplemental SQL Diagnostics

        ```sql
        -- Supplemental diagnostics (fuzzy + ES)
SELECT current_setting('server_version') AS server_version,
       pg_is_in_recovery() AS in_recovery;

SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

SELECT pid, usename, application_name, state, left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY query_start NULLS LAST;
        ```

        #### Supplemental Bash Snippets

        ```bash
        psql -X -Atqc "SELECT version();"
psql -X -Atqc "SELECT current_database();"
        ```

        #### Discussion & Interview Prompts

        - Where does “fuzzy + ES” show up in `EXPLAIN` plans and system catalogs?
- What are the operational risks during DDL changes while queries depend on this feature?
- How does this feature interact with connection pooling and prepared statements?
- What are the best metrics to monitor when rolling this out broadly?
- How do you validate correctness when migrating from another database engine?
- What are safe rollback strategies if an index or extension causes regressions?
- How do you document data contracts for APIs that surface this SQL behavior?
- What testing pyramid applies: unit SQL fixtures vs integration vs load tests?
- How does this capability behave differently across PostgreSQL major versions you support?
- What is your debugging workflow when results look “almost right” but not identical?

---

