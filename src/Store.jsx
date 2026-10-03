import React, { createContext, useContext, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

const ICPEP_SAMPLE_DATA = {
  requiredDues: 200.00,
  expenses: [
    { category: 'CpE General Assembly & Orientation', amount: 3500.00, date: '2026-09-05' },
    { category: 'Embedded Systems & Arduino Lab Kits', amount: 5200.00, date: '2026-09-14' },
    { category: 'Official ICpEP PRMSU Org Shirts', amount: 4800.00, date: '2026-09-20' },
  ],
  students: [
    { id: '2024-1001', name: 'Santos, Juan Miguel', amount: 200.00, date: '2026-09-10', ref: 'GCASH-982144', status: 'PAID', notes: 'Verified in bank account' },
    { id: '2024-1004', name: 'Tan, Kimberly Joy', amount: 100.00, date: '2026-09-12', ref: 'GCASH-829103', status: 'DISCREPANCY', notes: 'Partial Payment' },
    { id: '2024-1010', name: 'Lim, Joshua David', amount: 0.00, date: '—', ref: '—', status: 'UNPAID', notes: 'No payment record' }
  ]
};

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [requiredDues, setRequiredDues] = useState(200.00);
  const [gSheetUrl, setGSheetUrl] = useState(localStorage.getItem('icpep_prmsu_gsheet_url') || '');

  useEffect(() => {
    const savedData = localStorage.getItem('icpep_prmsu_local_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.students) setStudents(parsed.students);
        if (parsed.expenses) setExpenses(parsed.expenses);
      } catch (e) {
        console.warn('Could not parse local data', e);
      }
    }
  }, []);

  const loadSampleData = () => {
    setStudents(ICPEP_SAMPLE_DATA.students);
    setExpenses(ICPEP_SAMPLE_DATA.expenses);
    localStorage.setItem('icpep_prmsu_local_data', JSON.stringify({
        students: ICPEP_SAMPLE_DATA.students,
        expenses: ICPEP_SAMPLE_DATA.expenses
    }));
  };

  const resetData = () => {
    setStudents([]);
    setExpenses([]);
    localStorage.removeItem('icpep_prmsu_local_data');
  };

  const parseAndApplyCSV = (csvText) => {
    const workbook = XLSX.read(csvText, { type: 'string' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (!rawRows || rawRows.length < 2) return;

    const headers = rawRows[0].map(h => String(h || '').trim().toLowerCase());

    const colId = headers.findIndex(h => h.includes('student') || h.includes('id') || h.includes('number'));
    const colName = headers.findIndex(h => h.includes('name') || h.includes('full'));
    const colAmount = headers.findIndex(h => h.includes('amount') || h.includes('paid') || h.includes('fee'));
    const colRef = headers.findIndex(h => h.includes('ref') || h.includes('reference') || h.includes('transaction'));
    const colDate = headers.findIndex(h => h.includes('timestamp') || h.includes('date'));

    const parsedStudents = [];
    const seenRefs = new Set();

    for (let i = 1; i < rawRows.length; i++) {
      const row = rawRows[i];
      if (!row || row.length === 0) continue;

      const id = colId !== -1 ? String(row[colId] || `2024-${1000 + i}`) : `2024-${1000 + i}`;
      const name = colName !== -1 ? String(row[colName] || 'Student Roster Entry') : 'Student Roster Entry';
      const rawAmt = colAmount !== -1 ? parseFloat(String(row[colAmount]).replace(/[^0-9.]/g, '')) || 0 : requiredDues;
      const ref = colRef !== -1 ? String(row[colRef] || '—') : '—';
      const date = colDate !== -1 ? String(row[colDate] || '').slice(0, 10) : new Date().toISOString().slice(0, 10);

      let status = 'PAID';
      let notes = 'Cleared by Treasury';

      if (rawAmt === 0) {
        status = 'UNPAID';
        notes = 'Unpaid dues';
      } else if (rawAmt < requiredDues) {
        status = 'DISCREPANCY';
        notes = `Underpayment (₱${rawAmt} of ₱${requiredDues})`;
      } else if (ref !== '—' && seenRefs.has(ref.toLowerCase())) {
        status = 'DISCREPANCY';
        notes = `Duplicate transaction reference (${ref})`;
      }

      if (ref !== '—') seenRefs.add(ref.toLowerCase());

      parsedStudents.push({
        id: id.trim(),
        name: name.trim(),
        amount: rawAmt,
        date: date.trim() || '—',
        ref: ref.trim(),
        status: status,
        notes: notes
      });
    }

    if (parsedStudents.length > 0) {
      setStudents(parsedStudents);
      localStorage.setItem('icpep_prmsu_local_data', JSON.stringify({
        students: parsedStudents,
        expenses
      }));
    }
  };

  const fetchGoogleSheetData = async (url) => {
    try {
      let fetchUrl = url;
      if (url.includes('/edit')) {
        fetchUrl = url.split('/edit')[0] + '/export?format=csv';
      }

      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const csv = await response.text();
      parseAndApplyCSV(csv);
    } catch (err) {
      console.error('Google Sheet fetch error:', err);
      alert('Could not fetch Google Sheet. Make sure it is published to web as CSV.');
    }
  };

  useEffect(() => {
    if (gSheetUrl) {
      fetchGoogleSheetData(gSheetUrl);
      const interval = setInterval(() => {
        fetchGoogleSheetData(gSheetUrl);
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [gSheetUrl]);

  const updateGSheetUrl = (url) => {
    setGSheetUrl(url);
    if (url) {
      localStorage.setItem('icpep_prmsu_gsheet_url', url);
    } else {
      localStorage.removeItem('icpep_prmsu_gsheet_url');
    }
  };

  const handleFileUpload = (file) => {
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.SheetNames[0];
          const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[firstSheet]);
          parseAndApplyCSV(csv);
        } catch (err) {
          console.error(err);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (fileName.endsWith('.docx')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        mammoth.extractRawText({ arrayBuffer: e.target.result })
          .then((result) => {
            console.log(`Scanned Word Document (${result.value.length} chars).`);
            alert(`Successfully ingested Word Document with ${result.value.length} characters.`);
          })
          .catch(err => {
            console.error(err);
            alert(`Docx error: ${err.message}`);
          });
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert('Please upload a valid .xlsx, .csv, or .docx file.');
    }
  };

  return (
    <DataContext.Provider value={{
      students, expenses, requiredDues, gSheetUrl,
      loadSampleData, resetData, handleFileUpload, parseAndApplyCSV, updateGSheetUrl
    }}>
      {children}
    </DataContext.Provider>
  );
};
