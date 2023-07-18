const fs = require('fs');
const { Octokit } = require('@octokit/core');

async function manageLabels() {
  try {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    // Read the labels JSON file
    const labelsFile = fs.readFileSync('labels.json', 'utf8');
    const labels = JSON.parse(labelsFile);

    // Retrieve the repository information
    const repoInfo = process.env.GITHUB_REPOSITORY.split('/');
    const owner = repoInfo[0];
    const repo = repoInfo[1];

    // Loop through each label
    for (const label of labels) {
      const { name, color, description } = label;

      // Check if the label already exists
      const existingLabel = await octokit.request(
        `GET /repos/${owner}/${repo}/labels/${name}`
      );

      if (existingLabel.status === 200) {
        // Label exists, update its properties
        await octokit.request(
          `PATCH /repos/${owner}/${repo}/labels/${name}`,
          {
            color,
            description
          }
        );
        console.log(`Updated label: ${name}`);
      } else {
        // Label does not exist, create it
        await octokit.request(
          `POST /repos/${owner}/${repo}/labels`,
          {
            name,
            color,
            description
          }
        );
        console.log(`Created label: ${name}`);
      }
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

manageLabels();
