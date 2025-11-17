// tests/loadTest.js
// Script de teste de carga e performance
// Uso: node tests/loadTest.js

const autocannon = require('autocannon');
const Table = require('cli-table3');
const chalk = require('chalk');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3210';
const DURATION = parseInt(process.env.DURATION) || 30; // segundos
const CONNECTIONS = parseInt(process.env.CONNECTIONS) || 10;
const PIPELINING = parseInt(process.env.PIPELINING) || 1;

// Endpoints para testar
const endpoints = [
  { name: 'Home Page', url: '/' },
  { name: 'Categorias', url: '/nossascategorias' },
  { name: 'Pragas', url: '/nossosprodutos' },
  { name: 'Métodos', url: '/nossosmetodos' },
  { name: 'Busca', url: '/search?q=pulgão' },
  { name: 'Categoria Pragas', url: '/categoria/1/pragas' },
  { name: 'Detalhes Praga', url: '/products/1' },
  { name: 'Identificar', url: '/identificar' }
];

// Configuração de cores
const colors = {
  success: chalk.green,
  warning: chalk.yellow,
  error: chalk.red,
  info: chalk.blue,
  title: chalk.cyan.bold
};

/**
 * Executa teste de carga em um endpoint
 */
async function runLoadTest(endpoint) {
  console.log(colors.info(`\n🔬 Testando: ${endpoint.name}`));
  console.log(colors.info(`   URL: ${BASE_URL}${endpoint.url}`));
  
  return new Promise((resolve, reject) => {
    const instance = autocannon({
      url: `${BASE_URL}${endpoint.url}`,
      connections: CONNECTIONS,
      pipelining: PIPELINING,
      duration: DURATION,
      timeout: 10
    });

    autocannon.track(instance, {
      renderProgressBar: true,
      renderResultsTable: false
    });

    instance.on('done', (results) => {
      resolve({
        name: endpoint.name,
        url: endpoint.url,
        ...results
      });
    });

    instance.on('error', reject);
  });
}

/**
 * Formata bytes para unidade legível
 */
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

/**
 * Avalia performance com base em métricas
 */
function evaluatePerformance(result) {
  const { requests, latency, throughput } = result;
  
  // Critérios de avaliação
  const criteria = {
    excellent: {
      rps: 100,
      p99: 500,
      errors: 0
    },
    good: {
      rps: 50,
      p99: 1000,
      errors: 1
    },
    acceptable: {
      rps: 20,
      p99: 2000,
      errors: 5
    }
  };
  
  const rps = requests.average;
  const p99 = latency.p99;
  const errorRate = (requests.total - requests.sent) / requests.total * 100;
  
  if (rps >= criteria.excellent.rps && 
      p99 <= criteria.excellent.p99 && 
      errorRate <= criteria.excellent.errors) {
    return { grade: 'A+', color: colors.success, label: 'EXCELENTE' };
  }
  
  if (rps >= criteria.good.rps && 
      p99 <= criteria.good.p99 && 
      errorRate <= criteria.good.errors) {
    return { grade: 'A', color: colors.success, label: 'BOM' };
  }
  
  if (rps >= criteria.acceptable.rps && 
      p99 <= criteria.acceptable.p99 && 
      errorRate <= criteria.acceptable.errors) {
    return { grade: 'B', color: colors.warning, label: 'ACEITÁVEL' };
  }
  
  return { grade: 'C', color: colors.error, label: 'PRECISA MELHORAR' };
}

/**
 * Exibe resultados formatados
 */
function displayResults(results) {
  console.log('\n' + colors.title('═══════════════════════════════════════════════════'));
  console.log(colors.title('           RESULTADOS DO TESTE DE CARGA'));
  console.log(colors.title('═══════════════════════════════════════════════════\n'));
  
  const table = new Table({
    head: [
      'Endpoint',
      'RPS',
      'Latência (ms)\nP50 | P99',
      'Throughput',
      'Erros',
      'Nota'
    ],
    colWidths: [20, 12, 20, 15, 10, 15]
  });
  
  results.forEach(result => {
    const { requests, latency, throughput } = result;
    const evaluation = evaluatePerformance(result);
    const errorRate = ((requests.total - requests.sent) / requests.total * 100).toFixed(2);
    
    table.push([
      result.name,
      requests.average.toFixed(2),
      `${latency.p50} | ${latency.p99}`,
      formatBytes(throughput.average),
      `${errorRate}%`,
      evaluation.color(`${evaluation.grade}\n${evaluation.label}`)
    ]);
  });
  
  console.log(table.toString());
  
  // Estatísticas gerais
  const avgRps = results.reduce((sum, r) => sum + r.requests.average, 0) / results.length;
  const avgLatency = results.reduce((sum, r) => sum + r.latency.mean, 0) / results.length;
  const totalRequests = results.reduce((sum, r) => sum + r.requests.total, 0);
  
  console.log('\n' + colors.title('ESTATÍSTICAS GERAIS:'));
  console.log(`  Requisições por segundo (média): ${colors.info(avgRps.toFixed(2))}`);
  console.log(`  Latência média: ${colors.info(avgLatency.toFixed(2) + ' ms')}`);
  console.log(`  Total de requisições: ${colors.info(totalRequests.toLocaleString())}`);
  console.log(`  Duração total: ${colors.info(DURATION * endpoints.length + ' segundos')}`);
  console.log(`  Conexões simultâneas: ${colors.info(CONNECTIONS)}\n`);
}

/**
 * Recomendações baseadas nos resultados
 */
function generateRecommendations(results) {
  console.log(colors.title('RECOMENDAÇÕES:\n'));
  
  const recommendations = [];
  
  results.forEach(result => {
    const evaluation = evaluatePerformance(result);
    
    if (evaluation.grade === 'C') {
      recommendations.push({
        endpoint: result.name,
        issues: []
      });
      
      const rec = recommendations[recommendations.length - 1];
      
      if (result.requests.average < 20) {
        rec.issues.push('Baixo throughput - considere implementar cache');
      }
      
      if (result.latency.p99 > 2000) {
        rec.issues.push('Alta latência P99 - otimize queries do banco de dados');
      }
      
      const errorRate = (result.requests.total - result.requests.sent) / result.requests.total * 100;
      if (errorRate > 5) {
        rec.issues.push('Alta taxa de erro - verifique logs de erro');
      }
    }
  });
  
  if (recommendations.length === 0) {
    console.log(colors.success('  ✓ Todos os endpoints estão com boa performance!\n'));
  } else {
    recommendations.forEach(rec => {
      console.log(colors.warning(`  ⚠ ${rec.endpoint}:`));
      rec.issues.forEach(issue => {
        console.log(colors.warning(`    - ${issue}`));
      });
      console.log('');
    });
  }
}

/**
 * Função principal
 */
async function main() {
  console.log(colors.title('\n╔════════════════════════════════════════════════════╗'));
  console.log(colors.title('║         TESTE DE CARGA - PESTCONTROL PRO          ║'));
  console.log(colors.title('╚════════════════════════════════════════════════════╝\n'));
  
  console.log(colors.info('Configuração:'));
  console.log(`  URL Base: ${BASE_URL}`);
  console.log(`  Duração por endpoint: ${DURATION}s`);
  console.log(`  Conexões simultâneas: ${CONNECTIONS}`);
  console.log(`  Pipelining: ${PIPELINING}\n`);
  
  const results = [];
  
  try {
    for (const endpoint of endpoints) {
      const result = await runLoadTest(endpoint);
      results.push(result);
      
      // Pequena pausa entre testes
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    displayResults(results);
    generateRecommendations(results);
    
    // Salva resultados em JSON
    const fs = require('fs');
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `tests/results/load-test-${timestamp}.json`;
    
    fs.mkdirSync('tests/results', { recursive: true });
    fs.writeFileSync(filename, JSON.stringify(results, null, 2));
    
    console.log(colors.success(`\n✓ Resultados salvos em: ${filename}\n`));
    
  } catch (error) {
    console.error(colors.error('\n✗ Erro durante teste de carga:'), error);
    process.exit(1);
  }
}

// Executa se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { runLoadTest, displayResults };
