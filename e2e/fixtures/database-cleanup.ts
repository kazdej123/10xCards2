import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../src/db/database.types";

/**
 * Database cleanup utilities for e2e tests
 */
export class DatabaseCleanup {
  private supabase;

  constructor() {
    // Load environment variables from .env.test file
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error(
        "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.\n" +
          "Make sure these are set in your .env.test file."
      );
    }

    // eslint-disable-next-line no-console
    console.log("🔐 Using Supabase configuration from .env.test:");
    // eslint-disable-next-line no-console
    console.log(`   - URL: ${supabaseUrl}`);
    // eslint-disable-next-line no-console
    console.log(`   - Service Role Key: ${supabaseServiceRoleKey ? "[SET]" : "[NOT SET]"}`);

    this.supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  /**
   * Clean all test data from the database
   */
  async cleanupTestData(): Promise<void> {
    const cleanupEnabled = process.env.TEST_DATABASE_CLEANUP_ENABLED === "true";

    if (!cleanupEnabled) {
      // eslint-disable-next-line no-console
      console.log("🔄 Database cleanup is disabled");
      return;
    }

    // eslint-disable-next-line no-console
    console.log("🧹 Starting database cleanup...");

    try {
      const testUserIds = this.getTestUserIds();

      if (testUserIds.length > 0) {
        await this.cleanupForSpecificUsers(testUserIds);
      }

      const resetAll = process.env.TEST_DATABASE_RESET_ON_TEARDOWN === "true";
      if (resetAll) {
        await this.resetAllTables();
      }

      // eslint-disable-next-line no-console
      console.log("✅ Database cleanup completed");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("❌ Database cleanup failed:", error);
      throw error;
    }
  }

  /**
   * Get test user IDs from environment variables
   */
  private getTestUserIds(): string[] {
    const userIds: string[] = [];
    const testUserIdKeys = ["TEST_USER_ID_1", "TEST_USER_ID_2", "TEST_ADMIN_USER_ID"];

    for (const key of testUserIdKeys) {
      const userId = process.env[key];
      if (userId?.trim()) {
        userIds.push(userId.trim());
      }
    }

    return userIds;
  }

  /**
   * Clean up data for specific test users
   */
  private async cleanupForSpecificUsers(userIds: string[]): Promise<void> {
    // eslint-disable-next-line no-console
    console.log("🗑️  Cleaning flashcards...");
    await this.supabase.from("flashcards").delete().in("user_id", userIds);

    // eslint-disable-next-line no-console
    console.log("🗑️  Cleaning generations...");
    await this.supabase.from("generations").delete().in("user_id", userIds);

    // eslint-disable-next-line no-console
    console.log("🗑️  Cleaning error logs...");
    await this.supabase.from("generation_error_logs").delete().in("user_id", userIds);
  }

  /**
   * Reset all tables (use with extreme caution!)
   */
  private async resetAllTables(): Promise<void> {
    // eslint-disable-next-line no-console
    console.log("🚨 Resetting all tables!");

    const tables = ["flashcards", "generations", "generation_error_logs"] as const;

    for (const table of tables) {
      await this.supabase.from(table).delete().neq("id", 0);
    }
  }

  /**
   * Get database statistics (for debugging)
   */
  async getDatabaseStats(): Promise<void> {
    // eslint-disable-next-line no-console
    console.log("📊 Getting database statistics...");

    try {
      const { count: flashcardsCount } = await this.supabase
        .from("flashcards")
        .select("*", { count: "exact", head: true });

      const { count: generationsCount } = await this.supabase
        .from("generations")
        .select("*", { count: "exact", head: true });

      const { count: errorLogsCount } = await this.supabase
        .from("generation_error_logs")
        .select("*", { count: "exact", head: true });

      // eslint-disable-next-line no-console
      console.log(`📈 Database Statistics:
        - Flashcards: ${flashcardsCount ?? 0}
        - Generations: ${generationsCount ?? 0}
        - Error Logs: ${errorLogsCount ?? 0}`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("❌ Failed to get database statistics:", error);
    }
  }
}
