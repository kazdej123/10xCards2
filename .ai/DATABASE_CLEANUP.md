# Database Cleanup for E2E Tests

This document describes the Supabase database cleanup implementation for e2e tests.

## Environment Variables Configuration

### Important: Separate Test Environment

⚠️ **CRITICAL**: Always use a separate test database, never your production database!

The system loads environment variables from `.env.test` file (configured in `playwright.config.ts`):

```typescript
// playwright.config.ts loads .env.test automatically
dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });
```

### Required .env.test Configuration

Create a `.env.test` file in your project root with test database credentials:

```env
# Supabase Test Database Configuration
# ⚠️ These should point to your TEST database, NOT production!
SUPABASE_URL=https://your-test-project.supabase.co
SUPABASE_KEY=your-test-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-test-service-role-key

# Database cleanup configuration
TEST_DATABASE_CLEANUP_ENABLED=true
TEST_DATABASE_RESET_ON_TEARDOWN=false

# Test user IDs for targeted cleanup
TEST_USER_ID_1=test-user-1-uuid
TEST_USER_ID_2=test-user-2-uuid
TEST_ADMIN_USER_ID=test-admin-uuid

# Test user credentials (for auth setup)
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=testpassword123
ADMIN_USER_EMAIL=admin@example.com
ADMIN_USER_PASSWORD=adminpassword123
```

### Environment Variables vs Main App

- **Main app** (`src/`) uses `import.meta.env.SUPABASE_URL` from `.env` file
- **E2E tests** (`e2e/`) use `process.env.SUPABASE_URL` from `.env.test` file
- This separation ensures test database isolation from production

## How It Works

The cleanup uses two approaches:

1. **Project Dependencies** - Teardown project runs after all tests
2. **Global Teardown** - Global cleanup function

Both use the `DatabaseCleanup` utility class from `e2e/fixtures/database-cleanup.ts`.

## Database Tables Cleaned

- `flashcards` - User's flashcard data
- `generations` - AI generation metadata
- `generation_error_logs` - Error logs

## Usage

```bash
# Run tests with cleanup
npx playwright test

# Run without cleanup (debugging)
TEST_DATABASE_CLEANUP_ENABLED=false npx playwright test
```

## Safety Features

- Environment-based control
- Targeted cleanup by user ID
- Error handling
- Statistics logging

## File Structure

```
e2e/
├── fixtures/
│   ├── database-cleanup.ts       # Main cleanup utility class
│   ├── global-teardown.ts        # Global teardown implementation
│   └── ...
├── tests/
│   ├── database.cleanup.ts       # Teardown project test
│   └── ...
└── DATABASE_CLEANUP.md           # This documentation
```

## Troubleshooting

### Cleanup Not Running

- Check that `TEST_DATABASE_CLEANUP_ENABLED=true` in `.env.tests`
- Verify Supabase credentials are correct
- Check console output for error messages

### Permission Errors

- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Verify the service role has delete permissions on all tables

### Incomplete Cleanup

- Check that test user IDs are correctly set in `.env.tests`
- Use `TEST_DATABASE_RESET_ON_TEARDOWN=true` for complete cleanup (use with caution)

## Best Practices

1. **Use separate test database**: Never point to production
2. **Set specific test user IDs**: Avoid full database resets
3. **Monitor cleanup logs**: Check that cleanup is working as expected
4. **Test cleanup logic**: Verify cleanup doesn't remove data it shouldn't
5. **Use CI/CD environment variables**: Don't commit `.env.tests` to version control

## Security Considerations

- Store sensitive keys in CI/CD environment variables
- Use least privilege principle for service role
- Regularly rotate test database credentials
- Monitor test database access logs
