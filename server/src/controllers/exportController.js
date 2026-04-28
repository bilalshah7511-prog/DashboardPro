import { createObjectCsvWriter } from 'csv-writer'
import PDFDocument from 'pdfkit'
import pool from '../config/database.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Export users to CSV
export const exportUsersCSV = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email, role, gender, email_verified, created_at
      FROM users
      ORDER BY created_at DESC
    `)

    const users = result.rows.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      gender: user.gender,
      email_verified: user.email_verified ? 'Yes' : 'No',
      created_at: new Date(user.created_at).toLocaleString()
    }))

    const csvWriter = createObjectCsvWriter({
      path: path.join(__dirname, '../../temp/users.csv'),
      header: [
        { id: 'id', title: 'ID' },
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'role', title: 'Role' },
        { id: 'gender', title: 'Gender' },
        { id: 'email_verified', title: 'Email Verified' },
        { id: 'created_at', title: 'Created At' }
      ]
    })

    await csvWriter.writeRecords(users)

    res.download(path.join(__dirname, '../../temp/users.csv'), 'users.csv', (err) => {
      if (err) {
        console.error('Download error:', err)
      }
      // Clean up temp file
      fs.unlinkSync(path.join(__dirname, '../../temp/users.csv'))
    })
  } catch (error) {
    console.error('Export users CSV error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Export login records to CSV
export const exportLoginRecordsCSV = async (req, res) => {
  try {
    let query = `
      SELECT lr.id, u.name, u.email, lr.ip_address, lr.user_agent, lr.login_time
      FROM login_records lr
      JOIN users u ON lr.user_id = u.id
    `

    if (req.user.role !== 'admin') {
      query += ' WHERE lr.user_id = $1'
    }

    query += ' ORDER BY lr.login_time DESC'

    const result = req.user.role === 'admin'
      ? await pool.query(query)
      : await pool.query(query, [req.user.id])

    const records = result.rows.map(record => ({
      id: record.id,
      name: record.name,
      email: record.email,
      ip_address: record.ip_address,
      user_agent: record.user_agent,
      login_time: new Date(record.login_time).toLocaleString()
    }))

    const csvWriter = createObjectCsvWriter({
      path: path.join(__dirname, '../../temp/login_records.csv'),
      header: [
        { id: 'id', title: 'ID' },
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'ip_address', title: 'IP Address' },
        { id: 'user_agent', title: 'User Agent' },
        { id: 'login_time', title: 'Login Time' }
      ]
    })

    await csvWriter.writeRecords(records)

    res.download(path.join(__dirname, '../../temp/login_records.csv'), 'login_records.csv', (err) => {
      if (err) {
        console.error('Download error:', err)
      }
      fs.unlinkSync(path.join(__dirname, '../../temp/login_records.csv'))
    })
  } catch (error) {
    console.error('Export login records CSV error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Export users to PDF
export const exportUsersPDF = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email, role, gender, email_verified, created_at
      FROM users
      ORDER BY created_at DESC
    `)

    const doc = new PDFDocument({ margin: 50 })
    const filename = 'users_report.pdf'

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

    doc.pipe(res)

    // Header
    doc.fontSize(20).text('DashPro - Users Report', { align: 'center' })
    doc.moveDown()
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' })
    doc.moveDown(2)

    // Summary
    doc.fontSize(14).text(`Total Users: ${result.rows.length}`, { underline: true })
    doc.moveDown()

    // Table header
    const tableTop = doc.y
    const col1 = 50
    const col2 = 100
    const col3 = 250
    const col4 = 350
    const col5 = 420

    doc.fontSize(10).font('Helvetica-Bold')
    doc.text('ID', col1, tableTop)
    doc.text('Name', col2, tableTop)
    doc.text('Email', col3, tableTop)
    doc.text('Role', col4, tableTop)
    doc.text('Gender', col5, tableTop)

    doc.moveDown()
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
    doc.moveDown(0.5)

    // Table rows
    doc.font('Helvetica')
    result.rows.forEach((user, index) => {
      const y = doc.y

      if (y > 700) {
        doc.addPage()
        doc.y = 50
      }

      doc.text(user.id, col1, doc.y)
      doc.text(user.name.substring(0, 20), col2, doc.y)
      doc.text(user.email.substring(0, 15), col3, doc.y)
      doc.text(user.role, col4, doc.y)
      doc.text(user.gender, col5, doc.y)

      doc.moveDown()
    })

    // Footer
    doc.moveDown(2)
    doc.fontSize(8).text('DashPro © 2026 - Confidential', { align: 'center' })

    doc.end()
  } catch (error) {
    console.error('Export users PDF error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Export login records to PDF
export const exportLoginRecordsPDF = async (req, res) => {
  try {
    let query = `
      SELECT lr.id, u.name, u.email, lr.ip_address, lr.login_time
      FROM login_records lr
      JOIN users u ON lr.user_id = u.id
    `

    if (req.user.role !== 'admin') {
      query += ' WHERE lr.user_id = $1'
    }

    query += ' ORDER BY lr.login_time DESC LIMIT 100'

    const result = req.user.role === 'admin'
      ? await pool.query(query)
      : await pool.query(query, [req.user.id])

    const doc = new PDFDocument({ margin: 50 })
    const filename = 'login_records_report.pdf'

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

    doc.pipe(res)

    // Header
    doc.fontSize(20).text('DashPro - Login Records Report', { align: 'center' })
    doc.moveDown()
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' })
    doc.moveDown(2)

    // Summary
    doc.fontSize(14).text(`Total Records: ${result.rows.length}`, { underline: true })
    doc.moveDown()

    // Table header
    const tableTop = doc.y
    const col1 = 50
    const col2 = 100
    const col3 = 250
    const col4 = 400

    doc.fontSize(10).font('Helvetica-Bold')
    doc.text('ID', col1, tableTop)
    doc.text('Name', col2, tableTop)
    doc.text('Email', col3, tableTop)
    doc.text('Login Time', col4, tableTop)

    doc.moveDown()
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
    doc.moveDown(0.5)

    // Table rows
    doc.font('Helvetica')
    result.rows.forEach((record) => {
      const y = doc.y

      if (y > 700) {
        doc.addPage()
        doc.y = 50
      }

      doc.text(record.id, col1, doc.y)
      doc.text(record.name.substring(0, 20), col2, doc.y)
      doc.text(record.email.substring(0, 20), col3, doc.y)
      doc.text(new Date(record.login_time).toLocaleString(), col4, doc.y)

      doc.moveDown()
    })

    // Footer
    doc.moveDown(2)
    doc.fontSize(8).text('DashPro © 2026 - Confidential', { align: 'center' })

    doc.end()
  } catch (error) {
    console.error('Export login records PDF error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, '../../temp')
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true })
}
