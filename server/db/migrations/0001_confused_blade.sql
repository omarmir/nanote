CREATE TABLE `shared` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`path` text NOT NULL,
	`key` text NOT NULL,
	`writable` integer DEFAULT false NOT NULL,
	`expiry` integer
);
