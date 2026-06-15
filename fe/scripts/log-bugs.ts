// fe/scripts/log-bugs.ts
import * as fs from 'fs'
import * as path from 'path'

interface PlaywrightSpec {
  title: string
  ok: boolean
  file?: string
  tests: Array<{
    results: Array<{
      status: string
      error?: {
        message: string
        stack?: string
      }
      attachments?: Array<{
        name: string
        path?: string
        contentType: string
      }>
    }>
  }>
}

interface PlaywrightSuite {
  title: string
  specs: PlaywrightSpec[]
  suites?: PlaywrightSuite[]
}

interface PlaywrightReport {
  suites: PlaywrightSuite[]
}

function collectFailures(
  suite: PlaywrightSuite,
  parentTitle = '',
): Array<{ suite: string; spec: string; error: string; screenshot?: string }> {
  const failures: Array<{ suite: string; spec: string; error: string; screenshot?: string }> = []
  const currentTitle = parentTitle ? `${parentTitle} > ${suite.title}` : suite.title

  for (const spec of suite.specs ?? []) {
    if (!spec.ok) {
      const result = spec.tests?.[0]?.results?.[0]
      const errorMsg = result?.error?.message ?? 'Unknown error'
      const screenshot = result?.attachments?.find(
        (a) => a.name === 'screenshot' && a.path,
      )?.path

      failures.push({
        suite: currentTitle,
        spec: spec.title,
        error: errorMsg.split('\n')[0],
        screenshot,
      })
    }
  }

  for (const child of suite.suites ?? []) {
    failures.push(...collectFailures(child, currentTitle))
  }

  return failures
}

function run() {
  const reportPath = path.resolve('test-results/failures.json')

  if (!fs.existsSync(reportPath)) {
    console.error('Khong tim thay test-results/failures.json')
    console.error('Chay `npm run test:e2e` truoc.')
    process.exit(1)
  }

  const report: PlaywrightReport = JSON.parse(fs.readFileSync(reportPath, 'utf-8'))

  const failures: Array<{ suite: string; spec: string; error: string; screenshot?: string }> = []
  for (const suite of report.suites) {
    failures.push(...collectFailures(suite))
  }

  if (failures.length === 0) {
    console.log('Tat ca test deu pass. Khong co bug de log.')
    process.exit(0)
  }

  const now = new Date()
  const dateStr = now.toISOString().replace('T', ' ').slice(0, 16)
  const lines: string[] = [`# Bug Report - ${dateStr}\n`]

  failures.forEach((f, idx) => {
    const bugId = `BUG-${String(idx + 1).padStart(3, '0')}`
    lines.push(`## [${bugId}] ${f.suite}: ${f.spec}`)
    lines.push(`- **Test suite**: ${f.suite}`)
    lines.push(`- **Test case**: ${f.spec}`)
    lines.push(`- **Status**: FAILED`)
    lines.push(`- **Error**: \`${f.error}\``)
    if (f.screenshot) {
      lines.push(`- **Screenshot**: ${f.screenshot}`)
    }
    lines.push(`- **Steps to reproduce**: Derived tu test case "${f.spec}" trong suite "${f.suite}"`)
    lines.push(`- **Expected**: Test pass (assertion trong Playwright spec)`)
    lines.push(`- **Actual**: ${f.error}`)
    lines.push('')
  })

  const outputPath = path.resolve('test-results/bug-report.md')
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, lines.join('\n'), 'utf-8')

  console.log(`\nTim thay ${failures.length} bug(s):`)
  failures.forEach((f, idx) => {
    console.log(`   BUG-${String(idx + 1).padStart(3, '0')}: ${f.suite} > ${f.spec}`)
  })
  console.log(`\nBug report: test-results/bug-report.md`)
  console.log('\nNoi voi Claude: "log BUG-001, BUG-002 len Jira" de tao issue.')
}

run()
