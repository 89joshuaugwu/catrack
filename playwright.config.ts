import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir:"./tests/browser",
  workers:1,
  use:{baseURL:"http://localhost:3100",channel:"chrome",headless:true,trace:"retain-on-failure"},
  webServer:{command:"node node_modules/next/dist/bin/next start --port 3100",url:"http://localhost:3100",reuseExistingServer:false,timeout:60000},
});
