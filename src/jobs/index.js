require("dotenv").config();
const Bree = require("bree");
const path = require("path");

const jobs = [
  {
    name: "updateRunningStatusQuizAndPoll",
    interval: "10s",
  },
  {
    name: "updateTrialStatus",
    interval: "40s",
  },
  {
    name: "updateQuizAndPoll",
    interval: "50s",
  },
  {
    name: "updateResetSubscriptions",
    interval: "60s",
  },
  {
    name: "updateNotRenewalSubscriptions",
    interval: "100s",
  },
];

const jobPath = path.join(__dirname);
const bree = new Bree({
  root: jobPath,
  jobs: jobs,
});

(function () {
  console.log("---------------Admin Scheduler Invoked--------------------");
  bree.start();
})();
