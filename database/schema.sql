-- =========================================================
-- GURU AI JSKM CLEAN DATABASE DUMP / SCHEMA
-- Generated on: 2026-10-08 13:49:52
-- =========================================================

BEGIN TRANSACTION;
CREATE TABLE bookmarks (
	id INTEGER NOT NULL, 
	user_id INTEGER, 
	chapter INTEGER, 
	section VARCHAR(30), 
	title VARCHAR(255), 
	created_at DATETIME, major VARCHAR(30) DEFAULT 'DKV', 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);
CREATE TABLE chat_history (
	id INTEGER NOT NULL, 
	user_id INTEGER, 
	question TEXT, 
	answer TEXT, 
	chapter INTEGER, 
	section VARCHAR(30), 
	created_at DATETIME, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);
CREATE TABLE learning_progress (
	id INTEGER NOT NULL, 
	user_id INTEGER, 
	chapter INTEGER, 
	section VARCHAR(30), 
	completed BOOLEAN, 
	score FLOAT, 
	last_access DATETIME, major VARCHAR(30) DEFAULT 'DKV', 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);
CREATE TABLE quiz_results (
	id INTEGER NOT NULL, 
	student_id INTEGER, 
	student_name VARCHAR(150), 
	chapter_number INTEGER NOT NULL, 
	chapter_code VARCHAR(50), 
	chapter_title VARCHAR(255), 
	quiz_mode VARCHAR(50) NOT NULL, 
	total_questions INTEGER NOT NULL, 
	correct_answers INTEGER NOT NULL, 
	wrong_answers INTEGER NOT NULL, 
	score FLOAT NOT NULL, 
	answers_json TEXT, 
	questions_json TEXT, 
	created_at DATETIME, 
	PRIMARY KEY (id), 
	FOREIGN KEY(student_id) REFERENCES users (id)
);
CREATE TABLE users (
	id INTEGER NOT NULL, 
	nama VARCHAR(150) NOT NULL, 
	username VARCHAR(100), 
	password VARCHAR(255), 
	role VARCHAR(30), 
	kelas VARCHAR(30), 
	jurusan VARCHAR(50), 
	active BOOLEAN, 
	created_at DATETIME, email VARCHAR(150), nip VARCHAR(60), 
	PRIMARY KEY (id), 
	UNIQUE (username)
);
INSERT INTO "users" VALUES(1,'Administrator','admin','admin123','admin','-','DKV',1,'2026-09-20 22:34:37.879208',NULL,NULL);
CREATE INDEX ix_users_id ON users (id);
CREATE INDEX ix_quiz_results_id ON quiz_results (id);
COMMIT;
