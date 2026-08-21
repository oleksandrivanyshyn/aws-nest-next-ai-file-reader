const fs = require('fs');

const updates = {
  AWS_REGION: process.env.AWS_REGION,
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
  DYNAMODB_TABLE_NAME: process.env.DYNAMODB_TABLE_NAME,
};

const paths = [process.env.API_ENV_PATH, process.env.SERVERLESS_ENV_PATH];

for (const p of paths) {
  let content = '';

  if (fs.existsSync(p)) {
    content = fs.readFileSync(p, 'utf8');
  } else {
    const examplePath = p.endsWith('.env') ? `${p}.example` : p;
    if (fs.existsSync(examplePath)) {
      content = fs.readFileSync(examplePath, 'utf8');
    }
  }

  for (const [key, val] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    content = regex.test(content) ? content.replace(regex, `${key}=${val}`) : `${content}\n${key}=${val}`;
  }

  fs.writeFileSync(p, `${content.trim()}\n`, 'utf8');
  console.log(`Synchronized AWS config into ${p}`);
}
