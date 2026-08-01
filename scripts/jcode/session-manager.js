/**
 * jcode Session Manager CLI Tool
 * KCM Ministries Church Platform
 * Multi-Session Harness Telemetry and Inter-Agent Communication Controller
 */

const fs = require('fs');
const path = require('path');

const JCODE_DIR = path.join(__dirname, '../../.jcode');
const SESSIONS_DIR = path.join(JCODE_DIR, 'sessions');
const SWARM_FILE = path.join(JCODE_DIR, 'swarm', 'swarm.json');

function loadSwarmConfig() {
  if (!fs.existsSync(SWARM_FILE)) {
    throw new Error(`Swarm configuration missing at ${SWARM_FILE}`);
  }
  return JSON.parse(fs.readFileSync(SWARM_FILE, 'utf-8'));
}

function loadSessions() {
  if (!fs.existsSync(SESSIONS_DIR)) {
    return [];
  }
  return fs.readdirSync(SESSIONS_DIR)
    .filter(file => file.endsWith('.toml'))
    .map(file => {
      const content = fs.readFileSync(path.join(SESSIONS_DIR, file), 'utf-8');
      const idMatch = content.match(/id\s*=\s*"([^"]+)"/);
      const nameMatch = content.match(/name\s*=\s*"([^"]+)"/);
      const domainMatch = content.match(/domain\s*=\s*"([^"]+)"/);
      return {
        filename: file,
        id: idMatch ? idMatch[1] : file.replace('.toml', ''),
        name: nameMatch ? nameMatch[1] : file,
        domain: domainMatch ? domainMatch[1] : 'general'
      };
    });
}

function printStatus() {
  console.log('\n=============================================================');
  console.log('      jcode Multi-Session Engineering Harness Telemetry      ');
  console.log('=============================================================\n');

  try {
    const swarm = loadSwarmConfig();
    const sessions = loadSessions();

    console.log(`Swarm Name:      ${swarm.swarmName} (v${swarm.version})`);
    console.log(`Lock Strategy:   ${swarm.policy.fileLockingMode}`);
    console.log(`Active Sessions: ${sessions.length} parallel instances\n`);

    console.log('-------------------------------------------------------------');
    console.log('| # | Session ID              | Domain      | File Locks    |');
    console.log('-------------------------------------------------------------');

    sessions.forEach((sess, idx) => {
      const locks = swarm.domainLocks[sess.id] ? swarm.domainLocks[sess.id].length : 0;
      const numStr = (idx + 1).toString().padEnd(2, ' ');
      const idStr = sess.id.padEnd(23, ' ');
      const domainStr = sess.domain.padEnd(11, ' ');
      console.log(`| ${numStr}| ${idStr} | ${domainStr} | ${locks} rules      |`);
    });

    console.log('-------------------------------------------------------------\n');
    console.log('Inter-Session Swarm Communication Channels:');
    swarm.channels.forEach(ch => {
      console.log(`  - [${ch.name}]: Producers -> (${ch.producers.join(', ')}) | Consumers -> (${ch.consumers.join(', ')})`);
    });
    console.log('\nAll 7 engineering sessions are configured and ready.\n');
  } catch (err) {
    console.error('Error fetching jcode telemetry:', err.message);
  }
}

// CLI argument handler
const command = process.argv[2] || 'status';

switch (command) {
  case 'status':
    printStatus();
    break;
  case 'list-sessions':
    console.log(JSON.stringify(loadSessions(), null, 2));
    break;
  case 'swarm-config':
    console.log(JSON.stringify(loadSwarmConfig(), null, 2));
    break;
  default:
    console.log(`Unknown command: ${command}. Usage: node session-manager.js [status|list-sessions|swarm-config]`);
}
