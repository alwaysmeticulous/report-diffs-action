import { MainAction } from "../../../actions/main/main-action";
import { CloudComputeAction } from "../../../actions/cloud-compute/cloud-compute";
import { UploadAssetsAction } from "../../../actions/upload-assets/upload-assets";
import { EnhancedTestHarness } from "../../enhanced-test-harness";
import { ScenarioComposer } from "../../framework/scenario-composer";

describe("Multi-Action Integration Tests", () => {
  let harness: EnhancedTestHarness;

  beforeEach(async () => {
    harness = new EnhancedTestHarness({
      isolation: { enabled: true },
    });
    await harness.setup();
  });

  afterEach(async () => {
    await harness.cleanup();
  });

  describe("Main Action (Local Execution)", () => {
    it("should execute complete workflow with app-url", async () => {
      const scenario = new ScenarioComposer(harness, 'main-action-app-url')
        .withCustomStep('setup-main-action-inputs', async (ctx) => {
          process.env.INPUT_API_TOKEN = 'test-api-token';
          process.env.INPUT_GITHUB_TOKEN = 'test-github-token';
          process.env.INPUT_APP_URL = 'http://localhost:3000';
          process.env.INPUT_TESTS_FILE = './tests/meticulous.json';
        })
        .withPullRequest()
        .withSuccessfulTestRun();

      await scenario.execute();
      const action = new MainAction(harness.getDependencies());
      
      const exitCode = await action.run();
      expect(exitCode).toBe(0);
      harness.assertTestRunExecuted();
    });

    it("should handle deployment URL mode", async () => {
      const scenario = new ScenarioComposer(harness, 'main-action-deployment-url')
        .withCustomStep('setup-deployment-mode', async (ctx) => {
          process.env.INPUT_API_TOKEN = 'test-api-token';
          process.env.INPUT_GITHUB_TOKEN = 'test-github-token';
          process.env.INPUT_USE_DEPLOYMENT_URL = 'true';
          process.env.INPUT_ALLOWED_ENVIRONMENTS = 'production\nstaging';
        })
        .withCustomStep('mock-deployment', async (ctx) => {
          const mockOctokit = ctx.harness.github.getOctokit("token");
          mockOctokit.rest.repos.listDeployments.mockResolvedValue({
            data: [{
              id: 123,
              environment: 'production',
              state: 'success',
              statuses_url: 'https://api.github.com/repos/test/test/deployments/123/statuses',
            }],
          });
          
          mockOctokit.rest.repos.listDeploymentStatuses.mockResolvedValue({
            data: [{
              state: 'success',
              environment_url: 'https://deploy.example.com',
              target_url: 'https://deploy.example.com',
            }],
          });
        })
        .withPullRequest()
        .withSuccessfulTestRun();

      await scenario.execute();
      const action = new MainAction(harness.getDependencies());
      
      const exitCode = await action.run();
      expect(exitCode).toBe(0);
      
      // Verify deployment URL was used
      const testRunCalls = harness.meticulous.getExecuteTestRunCalls();
      expect(testRunCalls[0].appUrl).toBe('https://deploy.example.com');
    });

    it("should handle localhost aliases", async () => {
      const scenario = new ScenarioComposer(harness, 'main-action-localhost-aliases')
        .withCustomStep('setup-localhost-aliases', async (ctx) => {
          process.env.INPUT_API_TOKEN = 'test-api-token';
          process.env.INPUT_GITHUB_TOKEN = 'test-github-token';
          process.env.INPUT_APP_URL = 'http://localhost:3000';
          process.env.INPUT_LOCALHOST_ALIASES = 'api.localhost:8080\nwebsockets.localhost:9090';
        })
        .withPullRequest()
        .withSuccessfulTestRun();

      await scenario.execute();
      const action = new MainAction(harness.getDependencies());
      
      const exitCode = await action.run();
      expect(exitCode).toBe(0);
    });
  });

  describe("Cloud Compute Action", () => {
    it("should execute tests in Meticulous cloud", async () => {
      const scenario = new ScenarioComposer(harness, 'cloud-compute-basic')
        .withCustomStep('setup-cloud-compute-inputs', async (ctx) => {
          process.env.INPUT_API_TOKEN = 'test-api-token';
          process.env.INPUT_GITHUB_TOKEN = 'test-github-token';
          process.env.INPUT_APP_URL = 'https://staging.example.com';
        })
        .withCustomStep('setup-cloud-compute-mocks', async (ctx) => {
          // Mock cloud compute specific API calls
          ctx.harness.meticulous.updateOptions({
            cloudComputeTestRun: {
              success: true,
              testRunId: 'cloud-test-run-123',
              status: 'completed',
            },
          });
        })
        .withPullRequest();

      await scenario.execute();
      const action = new CloudComputeAction(harness.getDependencies());
      
      const exitCode = await action.run();
      expect(exitCode).toBe(0);
    });

    it("should handle projects.yaml configuration", async () => {
      const projectsYaml = `
projects:
  - name: frontend
    app_url: https://frontend.example.com
    tests_file: ./tests/frontend.json
  - name: backend
    app_url: https://backend.example.com
    tests_file: ./tests/backend.json
`;

      const scenario = new ScenarioComposer(harness, 'cloud-compute-projects-yaml')
        .withCustomStep('setup-projects-yaml', async (ctx) => {
          process.env.INPUT_GITHUB_TOKEN = 'test-github-token';
          process.env.INPUT_PROJECTS_YAML = projectsYaml;
          
          // Create projects.yaml file
          await ctx.harness.testEnvironment?.createFile('projects.yaml', projectsYaml);
        })
        .withCustomStep('setup-multi-project-mocks', async (ctx) => {
          ctx.harness.meticulous.updateOptions({
            cloudComputeTestRun: {
              success: true,
              projects: [
                { name: 'frontend', testRunId: 'frontend-123', status: 'completed' },
                { name: 'backend', testRunId: 'backend-456', status: 'completed' },
              ],
            },
          });
        })
        .withPullRequest();

      await scenario.execute();
      const action = new CloudComputeAction(harness.getDependencies());
      
      const exitCode = await action.run();
      expect(exitCode).toBe(0);
    });

    it("should handle head-sha override", async () => {
      const scenario = new ScenarioComposer(harness, 'cloud-compute-head-sha-override')
        .withCustomStep('setup-head-sha-override', async (ctx) => {
          process.env.INPUT_API_TOKEN = 'test-api-token';
          process.env.INPUT_GITHUB_TOKEN = 'test-github-token';
          process.env.INPUT_APP_URL = 'https://staging.example.com';
          process.env.INPUT_HEAD_SHA = 'custom-override-sha-123';
        })
        .withPullRequest({ headSha: 'original-pr-sha' });

      await scenario.execute();
      const action = new CloudComputeAction(harness.getDependencies());
      
      const exitCode = await action.run();
      expect(exitCode).toBe(0);
      
      // Verify custom SHA was used
      const testRunCalls = harness.meticulous.getExecuteTestRunCalls();
      expect(testRunCalls[0].commitSha).toBe('custom-override-sha-123');
    });
  });

  describe("Upload Assets Action", () => {
    it("should upload assets successfully", async () => {
      const scenario = new ScenarioComposer(harness, 'upload-assets-basic')
        .withCustomStep('setup-upload-assets-inputs', async (ctx) => {
          process.env.INPUT_API_TOKEN = 'test-api-token';
          process.env.INPUT_GITHUB_TOKEN = 'test-github-token';
          process.env.INPUT_APP_DIRECTORY = './build';
        })
        .withCustomStep('setup-build-directory', async (ctx) => {
          // Create mock build assets
          await ctx.harness.testEnvironment?.createFile('build/index.html', '<html><body>Test App</body></html>');
          await ctx.harness.testEnvironment?.createFile('build/static/js/main.js', 'console.log("Hello World");');
          await ctx.harness.testEnvironment?.createFile('build/static/css/main.css', 'body { margin: 0; }');
        })
        .withCustomStep('setup-upload-mocks', async (ctx) => {
          ctx.harness.meticulous.updateOptions({
            uploadAssets: {
              success: true,
              assetUrl: 'https://assets.meticulous.ai/uploads/test-upload-123',
              uploadId: 'upload-123',
            },
          });
        })
        .withPullRequest();

      await scenario.execute();
      const action = new UploadAssetsAction(harness.getDependencies());
      
      const exitCode = await action.run();
      expect(exitCode).toBe(0);
    });

    it("should handle custom rewrites configuration", async () => {
      const rewrites = [
        { source: "/api/(.*)", destination: "/api/index.html" },
        { source: "/blog/:slug", destination: "/blog/[slug].html" },
      ];

      const scenario = new ScenarioComposer(harness, 'upload-assets-rewrites')
        .withCustomStep('setup-rewrites', async (ctx) => {
          process.env.INPUT_API_TOKEN = 'test-api-token';
          process.env.INPUT_GITHUB_TOKEN = 'test-github-token';
          process.env.INPUT_APP_DIRECTORY = './dist';
          process.env.INPUT_REWRITES = JSON.stringify(rewrites);
        })
        .withCustomStep('setup-dist-directory', async (ctx) => {
          await ctx.harness.testEnvironment?.createFile('dist/index.html', '<html>SPA App</html>');
          await ctx.harness.testEnvironment?.createFile('dist/api/index.html', '{"api": "response"}');
        })
        .withPullRequest();

      await scenario.execute();
      const action = new UploadAssetsAction(harness.getDependencies());
      
      const exitCode = await action.run();
      expect(exitCode).toBe(0);
      
      // Verify rewrites were applied
      const uploadCalls = harness.meticulous.getUploadAssetsCalls();
      expect(uploadCalls[0].rewrites).toEqual(rewrites);
    });

    it("should handle upload failures gracefully", async () => {
      const scenario = new ScenarioComposer(harness, 'upload-assets-failure')
        .withCustomStep('setup-upload-failure', async (ctx) => {
          process.env.INPUT_API_TOKEN = 'test-api-token';
          process.env.INPUT_GITHUB_TOKEN = 'test-github-token';
          process.env.INPUT_APP_DIRECTORY = './build';
          
          ctx.harness.meticulous.updateOptions({
            uploadAssets: {
              success: false,
              error: 'Upload quota exceeded',
            },
            shouldThrow: true,
          });
        })
        .withPullRequest();

      await scenario.execute();
      const action = new UploadAssetsAction(harness.getDependencies());
      
      const exitCode = await action.run();
      expect(exitCode).toBe(1);
      harness.assertActionFailed("Upload quota exceeded");
    });
  });

  describe("Cross-Action Integration", () => {
    it("should run upload-assets followed by main action", async () => {
      // First, upload assets
      const uploadScenario = new ScenarioComposer(harness, 'upload-then-test')
        .withCustomStep('setup-upload', async (ctx) => {
          process.env.INPUT_API_TOKEN = 'test-api-token';
          process.env.INPUT_GITHUB_TOKEN = 'test-github-token';
          process.env.INPUT_APP_DIRECTORY = './build';
        })
        .withCustomStep('create-assets', async (ctx) => {
          await ctx.harness.testEnvironment?.createFile('build/index.html', '<html>Test</html>');
        })
        .withPullRequest();

      await uploadScenario.execute();
      const uploadAction = new UploadAssetsAction(harness.getDependencies());
      
      let exitCode = await uploadAction.run();
      expect(exitCode).toBe(0);

      // Then, run main action using uploaded assets
      const testScenario = new ScenarioComposer(harness, 'test-uploaded-assets')
        .withCustomStep('setup-main-with-upload', async (ctx) => {
          process.env.INPUT_APP_URL = 'https://assets.meticulous.ai/uploads/test-upload-123';
        })
        .withSuccessfulTestRun();

      await testScenario.execute();
      const mainAction = new MainAction(harness.getDependencies());
      
      exitCode = await mainAction.run();
      expect(exitCode).toBe(0);
    });

    it("should handle cloud-compute with custom project configuration", async () => {
      const scenario = new ScenarioComposer(harness, 'cloud-compute-advanced')
        .withCustomStep('setup-advanced-cloud-config', async (ctx) => {
          process.env.INPUT_GITHUB_TOKEN = 'test-github-token';
          
          // Multi-project configuration
          const projectsConfig = `
projects:
  - name: web-app
    api_token: \${WEB_APP_TOKEN}
    app_url: https://web-app.example.com
    tests_file: ./tests/web-app.json
    max_retries: 3
    parallel_tasks: 5
  - name: mobile-web
    api_token: \${MOBILE_TOKEN}  
    app_url: https://m.example.com
    tests_file: ./tests/mobile.json
    max_retries: 2
    parallel_tasks: 2
`;
          
          process.env.INPUT_PROJECTS_YAML = projectsConfig;
          process.env.WEB_APP_TOKEN = 'web-app-token-123';
          process.env.MOBILE_TOKEN = 'mobile-token-456';
        })
        .withPullRequest();

      await scenario.execute();
      const action = new CloudComputeAction(harness.getDependencies());
      
      const exitCode = await action.run();
      expect(exitCode).toBe(0);
    });
  });

  describe("Action-Specific Error Scenarios", () => {
    it("should handle main action proxy failures", async () => {
      const scenario = new ScenarioComposer(harness, 'main-action-proxy-failure')
        .withCustomStep('setup-proxy-failure', async (ctx) => {
          process.env.INPUT_APP_URL = 'http://localhost:3000';
          
          // Mock proxy startup failure
          ctx.harness.network.simulateProxyFailure('Connection refused');
        })
        .withPullRequest()
        .withSuccessfulTestRun();

      await scenario.execute();
      const action = new MainAction(harness.getDependencies());
      
      const exitCode = await action.run();
      expect(exitCode).toBe(1);
      harness.assertActionFailed("Connection refused");
    });

    it("should handle cloud-compute project validation failures", async () => {
      const invalidProjectsYaml = `
projects:
  - name: ""  # Invalid empty name
    api_token: token
  - api_token: token2  # Missing name
  - name: valid-project  # Missing api_token and app_url
`;

      const scenario = new ScenarioComposer(harness, 'cloud-compute-validation-failure')
        .withCustomStep('setup-invalid-projects', async (ctx) => {
          process.env.INPUT_GITHUB_TOKEN = 'test-github-token';
          process.env.INPUT_PROJECTS_YAML = invalidProjectsYaml;
        })
        .withPullRequest();

      await scenario.execute();
      const action = new CloudComputeAction(harness.getDependencies());
      
      const exitCode = await action.run();
      expect(exitCode).toBe(1);
      harness.assertActionFailed("Invalid project configuration");
    });

    it("should handle upload-assets directory not found", async () => {
      const scenario = new ScenarioComposer(harness, 'upload-assets-no-directory')
        .withCustomStep('setup-missing-directory', async (ctx) => {
          process.env.INPUT_API_TOKEN = 'test-api-token';
          process.env.INPUT_GITHUB_TOKEN = 'test-github-token';
          process.env.INPUT_APP_DIRECTORY = './non-existent-directory';
        })
        .withPullRequest();

      await scenario.execute();
      const action = new UploadAssetsAction(harness.getDependencies());
      
      const exitCode = await action.run();
      expect(exitCode).toBe(1);
      harness.assertActionFailed("Directory not found");
    });
  });
});