import assert from "node:assert/strict";

import { buildApplicationSearchFilter } from "../lib/application_search.ts";

function run() {
  const filterWithJobs = buildApplicationSearchFilter("Lubricentro", [12, 7, 12]);

  assert.equal(
    filterWithJobs,
    [
      "applicant_full_name.ilike.%Lubricentro%",
      "applicant_id_number.ilike.%Lubricentro%",
      "applicant_phone.ilike.%Lubricentro%",
      "job_id.in.(12,7)",
    ].join(","),
  );
  assert.doesNotMatch(filterWithJobs, /job\.title/);

  const filterWithoutJobs = buildApplicationSearchFilter("Lubricentro");

  assert.equal(
    filterWithoutJobs,
    [
      "applicant_full_name.ilike.%Lubricentro%",
      "applicant_id_number.ilike.%Lubricentro%",
      "applicant_phone.ilike.%Lubricentro%",
    ].join(","),
  );
  assert.doesNotMatch(filterWithoutJobs, /job_id\.in/);

  assert.equal(buildApplicationSearchFilter("   ", [1]), "");
}

try {
  run();
  console.log("application_search: ok");
} catch (error) {
  console.error("application_search: failed");
  throw error;
}
