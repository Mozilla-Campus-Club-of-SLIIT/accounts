-- new column to store user names from providers
ALTER TABLE UserConnections ADD COLUMN providerUserName VARCHAR(50);

-- add github as a provider
INSERT INTO Connections VALUES ('github');

-- use timestamp instead of date in user relation
ALTER TABLE Users ALTER COLUMN createdat TYPE TIMESTAMP;
ALTER TABLE Users ALTER COLUMN updatedAt TYPE TIMESTAMP;