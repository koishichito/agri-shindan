CREATE TABLE `equipment_sessions` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64),
	`conversationHistory` json,
	`finalDiagnosis` json,
	`status` enum('ongoing','completed') DEFAULT 'ongoing',
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `equipment_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plant_diagnoses` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64),
	`imageUrl` text,
	`description` text,
	`cropType` varchar(64),
	`temperature` int,
	`humidity` int,
	`ec` int,
	`result` json,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `plant_diagnoses_id` PRIMARY KEY(`id`)
);
