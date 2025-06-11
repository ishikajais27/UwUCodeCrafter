const express = require('express')
const cors = require('cors')
const { HfInference } = require('@huggingface/inference')
const { spawn } = require('child_process')
const fs = require('fs').promises
const path = require('path')
const crypto = require('crypto')
require('dotenv').config()

const app = express()
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
)

app.use(express.json())

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

function isCodeRequest(message) {
  const codeKeywords = [
    'code',
    'program',
    'function',
    'script',
    'implement',
    'write',
    'create',
    'develop',
    'generate',
    'class',
    'algorithm',
    'solution',
    'build',
    'make',
  ]
  return codeKeywords.some((keyword) => message.toLowerCase().includes(keyword))
}

function pythOWOify(code) {
  return code
    .replace(/def\s+(\w+)\s*\((.*?)\):/g, 'FWUNCTION $1($2) ->')
    .replace(/if\s+(.*?):/g, 'IF $1 THWEN')
    .replace(/elif\s+(.*?):/g, 'EWIF $1 THWEN')
    .replace(/else:/g, 'EWSE')
    .replace(/for\s+(\w+)\s+in\s+range\((\d+)\):/g, 'FOR $1 = 0 TO $2 THWEN')
    .replace(
      /for\s+(\w+)\s+in\s+range\((\w+),\s*(\w+)\):/g,
      'FOR $1 = $2 TO $3 THWEN'
    )
    .replace(/(\w+)\s*=\s*/g, 'pwease $1 = ')
    .replace(/print/g, 'pwint')
    .replace(/(?<=\n\s*)((?:\s*[^#\s].*\n)+)(?=\s*(?:\S|$))/g, (block) => {
      if (block.includes('THWEN') || block.includes('FWUNCTION')) {
        return block + 'END\n'
      }
      return block
    })
    .replace(/# (.*)/g, (match, comment) => {
      const uwuified = comment
        .replace(/[rl]/g, 'w')
        .replace(/[RL]/g, 'W')
        .replace(/th/g, 'd')
        .replace(/function/g, 'fwunction')
        .replace(/returns/g, 'wetuwns')
        .replace(/the/g, 'de')

      const uwuEmotes = ['OwO', '(=^･ω･^=)', 'UwU', ':3', 'Nyaa~', '(｡♥‿♥｡)']
      const randomEmote =
        uwuEmotes[Math.floor(Math.random() * uwuEmotes.length)]

      return `# ${uwuified} ${randomEmote}`
    })
}

const SYSTEM_PROMPT = `You are a code generator that writes code in PythOwO, a cute variant of Python. Here's the syntax:

Variables:
- Use 'pwease' for variable declarations
- Example: pwease baka = 100

Conditionals:
- IF {condition} THWEN {expression}
- EWIF {condition} THWEN {expression}
- EWSE {expression}

Conditionals Example:
    pwease num1 = 10
    pwease num2 = 25
    pwease num3 = 15
    pwease largest = num1
    IF num2 > largest THWEN pwease largest = num2 EWSE pwease largest = largest
    IF num3 > largest THWEN pwease largest = num3 EWSE pwease largest = largest
    pwint("The largest number is: ")
    pwint(largest)

Loops:
- FOR i = 0 TO 5 THWEN
  {code}
END

Functions:
- FWUNCTION name(params) -> {expression}

Print:
- Use 'pwint' instead of 'print'

Generate only clean, working PythOwO code with proper syntax. No explanations, just code.`

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body

    if (!message) {
      return res.status(400).json({
        error: 'Nyaa~ I need a message to genewate code! (｡•́︿•̀｡)',
      })
    }

    if (!isCodeRequest(message)) {
      res.write(
        `data: ${JSON.stringify({
          content:
            "UwU~ I can onwy genewate code! Ask me to wite some code and I'll make it supew kawaii! (｡♥‿♥｡)",
        })}\n\n`
      )
      res.write('data: [DONE]\n\n')
      return res.end()
    }

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    const prompt = `Generate a PythOwO program that solves this task: ${message}
        Rules:
        - Use proper PythOwO syntax (not regular Python)
        - Keep the code simple and focused
        - Only generate code, no explanations
        
        Generate code:`

    const stream = hf.chatCompletionStream({
      model: 'Qwen/Qwen2.5-72B-Instruct',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 0.9,
    })

    for await (const chunk of stream) {
      if (chunk.choices && chunk.choices.length > 0) {
        const newContent = chunk.choices[0].delta.content
        const owoContent = pythOWOify(newContent)
        res.write(`data: ${JSON.stringify({ content: owoContent })}\n\n`)
      }
    }

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({
      error: 'Oopsie woopsie! Someting went wong! (╥﹏╥)',
    })
  }
})

app.post('/run', async (req, res) => {
  const { code } = req.body

  if (!code) {
    return res.status(400).json({
      error: 'No code pwovided! (｡•́︿•̀｡)',
    })
  }

  try {
    const tmpDir = path.join(__dirname, 'tmp')
    await fs.mkdir(tmpDir, { recursive: true })
    const tmpFile = path.join(tmpDir, `code_${Date.now()}.pyowo`)
    await fs.writeFile(tmpFile, code)

    const output = await new Promise((resolve, reject) => {
      let stdout = ''
      let stderr = ''

      const pythowo = spawn('python', ['pythowo.py', tmpFile])

      pythowo.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      pythowo.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      pythowo.on('close', (code) => {
        fs.unlink(tmpFile).catch(console.error)

        if (code !== 0) {
          reject(new Error(stderr || 'Execution failed'))
        } else {
          resolve(stdout)
        }
      })
    })

    res.json({ output })
  } catch (error) {
    console.log('Error running code:', error)
    res.status(500).json({
      error: `Oopsie woopsie! An ewwow occuwwed: ${error.message} (╥﹏╥)`,
    })
  }
})

// Share endpoint
app.post('/share', async (req, res) => {
  const { code } = req.body

  if (!code) {
    return res.status(400).json({
      error: 'No code pwovided! (｡•́︿•̀｡)',
    })
  }

  try {
    // Generate a random filename
    const filename = crypto.randomBytes(8).toString('hex') + '.py'
    const sharePath = '/www/wwwroot/uwuforge/share'
    const filePath = path.join(sharePath, filename)

    // Create directory if it doesn't exist
    await fs.mkdir(sharePath, { recursive: true })

    // Write the code to file
    await fs.writeFile(filePath, code, 'utf-8')

    // Generate the share URL
    const shareUrl = `https://uwuforge.teamitj.tech/share/${filename}`

    res.json({
      url: shareUrl,
      message: 'Code shared successfuwwy! (✿◠‿◠)',
    })
  } catch (error) {
    console.error('Error sharing code:', error)
    res.status(500).json({
      error: `Oopsie woopsie! An ewwow occuwwed: ${error.message} (╥﹏╥)`,
    })
  }
})

// Serve shared files endpoint
app.get('/favicon.ico', (req, res) => {
  res.status(204).end()
})
app.get('/share/:filename', async (req, res) => {
  try {
    const { filename } = req.params
    const filePath = path.join('/home/www/uwuforge/share', filename)

    // Basic security check for path traversal
    if (!filename.match(/^[a-f0-9]+\.py$/)) {
      return res.status(400).json({
        error: 'Invalid filename! (｡•́︿•̀｡)',
      })
    }

    const code = await fs.readFile(filePath, 'utf-8')
    res.type('text/plain').send(code)
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({
        error: 'File not found! (╥﹏╥)',
      })
    } else {
      console.error('Error reading shared code:', error)
      res.status(500).json({
        error: 'Oopsie woopsie! Something went wong! (╥﹏╥)',
      })
    }
  }
})

// Optional: Cleanup old shared files (run periodically)
async function cleanupOldFiles() {
  try {
    const sharePath = '/home/www/uwuforge/share'
    const files = await fs.readdir(sharePath)
    const now = Date.now()
    const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

    for (const file of files) {
      const filePath = path.join(sharePath, file)
      const stats = await fs.stat(filePath)
      const fileAge = now - stats.mtime.getTime()

      if (fileAge > maxAge) {
        await fs.unlink(filePath)
        console.log(`Deleted old file: ${file}`)
      }
    }
  } catch (error) {
    console.error('Error cleaning up old files:', error)
  }
}

// Run cleanup every 24 hours
setInterval(cleanupOldFiles, 24 * 60 * 60 * 1000)

const PORT = process.env.PORT || 9000
app.listen(PORT, () => {
  console.log(`Sewvew is wunning on powt ${PORT} (◕‿◕✿)`)
})
