export const INSERT_USER_QUERY = `
INSERT INTO users (username, email, password_hash)
VALUES ($1, $2, $3)
RETURNING id, username, email;
`;

export const INSERT_USER_PROFILE_QUERY = `
INSERT INTO user_profiles (user_id, full_name, bio, profile_pic_url)
VALUES ($1, $2, $3, $4)
RETURNING full_name, bio, profile_pic_url;
`;

export const INSERT_USER_PROFILE_WITH_DEFAULT_PIC_QUERY = `
INSERT INTO user_profiles (user_id, full_name, bio, profile_pic_url)
VALUES ($1, $2, $3, DEFAULT)
RETURNING full_name, bio, profile_pic_url;
`;

export const SELECT_USER_BY_EMAIL_QUERY = `
SELECT id, username, email, password_hash
FROM users
WHERE email = $1
LIMIT 1;
`;