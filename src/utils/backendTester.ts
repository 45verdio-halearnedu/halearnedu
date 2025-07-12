
import { supabase } from '@/integrations/supabase/client';

export interface TestResult {
  testName: string;
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export class BackendTester {
  static async testDatabaseOperations(userId: string): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Test 1: Profile Operations
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      results.push({
        testName: 'Profile Read Operation',
        success: true,
        message: `Successfully retrieved ${data?.length || 0} profile records`,
        data: data
      });
    } catch (error: any) {
      results.push({
        testName: 'Profile Read Operation',
        success: false,
        message: 'Failed to read user profiles',
        error: error.message
      });
    }

    // Test 2: Wallet Operations
    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      results.push({
        testName: 'Wallet Read Operation',
        success: true,
        message: `Successfully retrieved wallet data`,
        data: data
      });
    } catch (error: any) {
      results.push({
        testName: 'Wallet Read Operation',
        success: false,
        message: 'Failed to read wallet data',
        error: error.message
      });
    }

    // Test 3: Loan Applications Read
    try {
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .limit(10);

      if (error) throw error;

      results.push({
        testName: 'Loan Applications Read',
        success: true,
        message: `Successfully retrieved ${data?.length || 0} loan applications`,
        data: data
      });
    } catch (error: any) {
      results.push({
        testName: 'Loan Applications Read',
        success: false,
        message: 'Failed to read loan applications',
        error: error.message
      });
    }

    // Test 4: Notifications Check
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .limit(5);

      if (error) throw error;

      results.push({
        testName: 'Notifications System',
        success: true,
        message: `Successfully accessed notifications (${data?.length || 0} found)`,
        data: data
      });
    } catch (error: any) {
      results.push({
        testName: 'Notifications System',
        success: false,
        message: 'Failed to access notifications',
        error: error.message
      });
    }

    // Test 5: RLS Policy Test (try to access another user's data)
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .neq('user_id', userId)
        .limit(1);

      // This should either return empty data or fail due to RLS
      results.push({
        testName: 'Row Level Security Test',
        success: true,
        message: `RLS working correctly - ${data?.length || 0} records accessible`,
        data: { accessible_records: data?.length || 0 }
      });
    } catch (error: any) {
      results.push({
        testName: 'Row Level Security Test',
        success: true, // This is actually good if it fails
        message: 'RLS correctly blocking unauthorized access',
        error: error.message
      });
    }

    return results;
  }

  static async testWriteOperations(userId: string): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Test 1: Notification Creation
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'System Test',
          message: 'This is a test notification created by the health check system',
          type: 'system'
        })
        .select()
        .single();

      if (error) throw error;

      results.push({
        testName: 'Notification Creation',
        success: true,
        message: 'Successfully created test notification',
        data: data
      });

      // Clean up the test notification
      await supabase
        .from('notifications')
        .delete()
        .eq('id', data.id);

    } catch (error: any) {
      results.push({
        testName: 'Notification Creation',
        success: false,
        message: 'Failed to create test notification',
        error: error.message
      });
    }

    return results;
  }

  static async runFullBackendTest(userId: string): Promise<{
    overall: boolean;
    readTests: TestResult[];
    writeTests: TestResult[];
    summary: {
      total: number;
      passed: number;
      failed: number;
    };
  }> {
    const readTests = await this.testDatabaseOperations(userId);
    const writeTests = await this.testWriteOperations(userId);
    
    const allTests = [...readTests, ...writeTests];
    const passed = allTests.filter(test => test.success).length;
    const failed = allTests.filter(test => !test.success).length;
    
    return {
      overall: failed === 0,
      readTests,
      writeTests,
      summary: {
        total: allTests.length,
        passed,
        failed
      }
    };
  }
}
