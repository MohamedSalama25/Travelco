const ExcelJS = require('exceljs');

/**
 * Generate Excel file for Transfers
 */
const generateTransfersExcel = async (transfers, res, filename = 'transfers') => {
    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet('Transfers', {
        views: [
            { rightToLeft: true, state: 'frozen', ySplit: 1 }
        ]
    });

    // تعريف الأعمدة
    worksheet.columns = [
        { header: 'رقم الحجز', key: 'booking_number', width: 15 },
        { header: 'اسم العميل', key: 'name', width: 25 },
        { header: 'الهاتف', key: 'phone', width: 15 },
        { header: 'جهة الإصدار', key: 'air_comp', width: 20 },
        { header: 'المطار', key: 'airPort', width: 20 },
        { header: 'الدولة', key: 'country', width: 15 },
        { header: 'تاريخ السفر', key: 'take_off_date', width: 15 },
        { header: 'تكلفة التذكرة', key: 'ticket_salary', width: 15 },
        { header: 'سعر البيع', key: 'ticket_price', width: 15 },
        { header: 'المدفوع', key: 'total_paid', width: 15 },
        { header: 'المتبقي', key: 'remaining_amount', width: 15 },
        { header: 'الحالة', key: 'status', width: 14 },
        { header: 'الربح', key: 'profit', width: 15 },
        { header: 'تاريخ الإنشاء', key: 'createdAt', width: 15 }
    ];

    /* =====================
       تنسيق الهيدر
    ====================== */
    const headerRow = worksheet.getRow(1);
    headerRow.height = 30;

    headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1F4E78' }
        };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });

    // فلترة + تثبيت الهيدر
    worksheet.autoFilter = {
        from: 'A1',
        to: 'N1'
    };

    /* =====================
       إضافة البيانات
    ====================== */
    transfers.forEach(transfer => {
        const airCompName = transfer.air_comp?.name || transfer.air_comp || '--';

        const row = worksheet.addRow({
            // 👈 حل مشكلة الاتجاه (RTL)
            booking_number: '\u200F' + String(transfer.booking_number),

            name: transfer.customer?.name || '--',
            phone: transfer.customer?.phone || '--',
            air_comp: airCompName,
            airPort: transfer.airPort,
            country: transfer.country,
            take_off_date: transfer.take_off_date
                ? new Date(transfer.take_off_date)
                : '',
            ticket_salary: transfer.ticket_salary || 0,
            ticket_price: transfer.ticket_price || 0,
            total_paid: transfer.total_paid || 0,
            remaining_amount: transfer.remaining_amount || 0,
            status: getStatusArabic(transfer.status),
            profit: (transfer.ticket_price || 0) - (transfer.ticket_salary || 0),
            createdAt: transfer.createdAt
                ? new Date(transfer.createdAt)
                : ''
        });

        // تنسيق الصف
        row.eachCell((cell) => {
            cell.alignment = {
                vertical: 'middle',
                horizontal: 'center'
            };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
    });

    /* =====================
       تنسيقات الأعمدة
    ====================== */

    // محاذاة رقم الحجز يمين
    worksheet.getColumn('A').alignment = {
        horizontal: 'right',
        vertical: 'middle'
    };

    // الأعمدة المالية
    ['H', 'I', 'J', 'K', 'M'].forEach(col => {
        worksheet.getColumn(col).numFmt = '#,##0.00';
    });

    // التواريخ
    ['G', 'N'].forEach(col => {
        worksheet.getColumn(col).numFmt = 'dd/mm/yyyy';
    });

    /* =====================
       إرسال الملف
    ====================== */
    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        `attachment; filename=${filename}_${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
};


/**
 * Generate Excel file for Customers
 */
const generateCustomersExcel = async (customers, res, filename = 'customers') => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Customers');

    worksheet.columns = [
        { header: 'الاسم', key: 'name', width: 25 },
        { header: 'الهاتف', key: 'phone', width: 15 },
        { header: 'البريد الإلكتروني', key: 'email', width: 25 },
        { header: 'رقم الهوية', key: 'national_id', width: 15 },
        { header: 'رقم جواز السفر', key: 'passport_number', width: 18 },
        { header: 'الجنسية', key: 'nationality', width: 15 },
        { header: 'العنوان', key: 'address', width: 30 },
        { header: 'ملاحظات', key: 'notes', width: 30 },
        { header: 'تاريخ التسجيل', key: 'createdAt', width: 15 }
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    customers.forEach(customer => {
        worksheet.addRow({
            name: customer.name,
            phone: customer.phone,
            email: customer.email || '',
            national_id: customer.national_id || '',
            passport_number: customer.passport_number || '',
            nationality: customer.nationality || '',
            address: customer.address || '',
            notes: customer.notes || '',
            createdAt: customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('ar-EG') : ''
        });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}_${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
};

/**
 * Generate Excel file for Payments
 */
const generatePaymentsExcel = async (payments, res, filename = 'payments') => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payments');

    worksheet.columns = [
        { header: 'رقم الحجز', key: 'booking_number', width: 15 },
        { header: 'اسم العميل', key: 'customer_name', width: 25 },
        { header: 'المبلغ', key: 'amount', width: 15 },
        { header: 'تاريخ الدفع', key: 'payment_date', width: 15 },
        { header: 'طريقة الدفع', key: 'payment_method', width: 15 },
        { header: 'رقم الإيصال', key: 'receipt_number', width: 15 },
        { header: 'ملاحظات', key: 'notes', width: 30 }
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    payments.forEach(payment => {
        worksheet.addRow({
            booking_number: payment.transfer?.booking_number || '',
            customer_name: payment.transfer?.customer?.name || '--',
            amount: payment.amount,
            payment_date: payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('ar-EG') : '',
            payment_method: getPaymentMethodArabic(payment.payment_method),
            receipt_number: payment.receipt_number || '',
            notes: payment.notes || ''
        });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}_${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
};

/**
 * Generate Excel file for Reports
 */
const generateReportExcel = async (data, reportType, res, filename = 'report') => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');

    if (reportType === 'aircomp_stats') {
        worksheet.columns = [
            { header: 'جهة الإصدار', key: 'name', width: 25 },
            { header: 'عدد التذاكر', key: 'ticketsCount', width: 15 },
            { header: 'إجمالي المبيعات', key: 'totalSales', width: 18 },
            { header: 'إجمالي التكلفة', key: 'totalCost', width: 18 },
            { header: 'إجمالي الأرباح', key: 'totalProfit', width: 18 },
            { header: 'المبالغ المتبقية', key: 'remainingAmount', width: 18 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

        data.forEach(item => {
            worksheet.addRow({
                name: item.name,
                ticketsCount: item.ticketsCount,
                totalSales: item.totalSales,
                totalCost: item.totalCost,
                totalProfit: item.totalProfit,
                remainingAmount: item.remainingAmount
            });
        });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}_${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
};

/**
 * Generate Excel file for Treasury History
 */
const generateTreasuryExcel = async (history, res, filename = 'treasury_history') => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Treasury History', {
        views: [{ rightToLeft: true, state: 'frozen', ySplit: 1 }]
    });

    worksheet.columns = [
        { header: 'التاريخ', key: 'createdAt', width: 20 },
        { header: 'الوصف', key: 'description', width: 40 },
        { header: 'النوع', key: 'type', width: 15 },
        { header: 'المبلغ', key: 'amount', width: 15 },
        { header: 'المرجع', key: 'relatedModel', width: 15 },
        { header: 'بواسطة', key: 'createdBy', width: 20 }
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
    });

    history.forEach(item => {
        worksheet.addRow({
            createdAt: new Date(item.createdAt).toLocaleString('ar-EG'),
            description: item.description,
            type: item.type === 'in' ? 'دخل' : 'خرج',
            amount: item.amount,
            relatedModel: getRelatedModelArabic(item.relatedModel),
            createdBy: item.createdBy?.user_name || '--'
        });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}_${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
};

// Helper functions
const getStatusArabic = (status) => {
    const statusMap = {
        'paid': 'مدفوع',
        'partial': 'جزئي',
        'unpaid': 'غير مدفوع',
        'cancel': 'ملغاة'
    };
    return statusMap[status] || status;
};

const getPaymentMethodArabic = (method) => {
    const methodMap = {
        'cash': 'نقدي',
        'card': 'بطاقة',
        'transfer': 'تحويل',
        'check': 'شيك',
        'other': 'أخرى'
    };
    return methodMap[method] || method;
};

const getRelatedModelArabic = (model) => {
    const modelMap = {
        'Transfer': 'حجز',
        'Payment': 'دفعة',
        'Expense': 'مصروف',
        'Other': 'أخرى'
    };
    return modelMap[model] || model;
};

module.exports = {
    generateTransfersExcel,
    generateCustomersExcel,
    generatePaymentsExcel,
    generateReportExcel,
    generateTreasuryExcel
};
