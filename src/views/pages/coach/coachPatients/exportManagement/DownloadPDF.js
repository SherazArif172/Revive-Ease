import { format } from "date-fns";
import jsPDF from "jspdf";
import { formatDate, formatDateOnly } from "../../../../../utils/dateUtils";

export function generatePDF({ selectedCPTs, patient, firstRecord }) {
    if (!selectedCPTs || selectedCPTs.length === 0) {
        alert("Please select at least one CPT code to generate the PDF.");
        return;
    }
    const doc = new jsPDF();
    // Set font family to Arial/Helvetica (helvetica in jsPDF)
    doc.setFont("helvetica", "normal");
    fillPDF(doc, { selectedCPTs, patient, firstRecord });
    doc.save(`${patient?.first_name} Report.pdf`);
}

export function generatePDFBuffer({ selectedCPTs, patient, firstRecord }) {
    if (!selectedCPTs || selectedCPTs.length === 0) {
        return null;
    }
    const doc = new jsPDF();
    // Set font family to Arial/Helvetica (helvetica in jsPDF)
    doc.setFont("helvetica", "normal");
    fillPDF(doc, { selectedCPTs, patient, firstRecord });
    return doc.output('arraybuffer');
}

// Helper function to safely get patient name
function getPatientName(patient) {
    if (!patient) return "";
    const parts = [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean);
    return parts.join(" ") || "";
}

// Helper function to safely get provider name
function getProviderName(patient) {
    const provider = patient?.providerName || patient?.provider;
    if (!provider) return "";
    const parts = [provider?.md_type, provider?.first_name, provider?.middle_name, provider?.last_name].filter(Boolean);
    return parts.join(" ") || "";
}

// Helper function to format date or return empty string
function formatDateOrEmpty(date, format) {
    if (!date) return "";
    try {
        return formatDate(date, format);
    } catch (e) {
        return "";
    }
}

// Helper function to extract year from billing_month (format: "YYYY-MM")
function getYearFromBillingMonth(billingMonth) {
    if (!billingMonth) return null;
    const parts = billingMonth.split("-");
    if (parts.length >= 1) {
        const year = parseInt(parts[0], 10);
        return isNaN(year) ? null : year;
    }
    return null;
}

// Format billing_month (YYYY-MM) as month name (e.g. "January") without timezone conversion.
// formatDate("2026-01-01", "MMMM") treats the string as UTC midnight and converts to Eastern,
// which can yield the previous calendar day/month (e.g. December). This helper parses YYYY-MM
// and formats using a local calendar date so "2026-01" always gives "January".
function getMonthNameFromBillingMonth(billingMonth) {
    if (!billingMonth) return "";
    const parts = billingMonth.split("-").map((p) => parseInt(p, 10));
    if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return "";
    const [year, month] = parts;
    if (month < 1 || month > 12) return "";
    return format(new Date(year, month - 1, 1), "MMMM");
}

// Helper: "X unique day" or "X unique days" (correct singular/plural)
function formatUniqueDaysPhrase(count) {
    const n = Number(count);
    if (isNaN(n)) return `${count} unique days`;
    return n === 1 ? "1 unique day" : `${n} unique days`;
}

// Helper: normalize totalMinutes — if value is HH:MM:SS or HH:MM duration string, return minutes number; else return as-is (e.g. "[XX]")
function formatMinutesForDisplay(value) {
    if (value == null || value === "") return "[XX]";
    const num = Number(value);
    if (!isNaN(num)) return String(num);
    const s = String(value).trim();
    const parts = s.split(":").map((p) => parseInt(p, 10));
    if (parts.length === 3 && parts.every((n) => !isNaN(n))) {
        return String(parts[0] * 60 + parts[1] + Math.round(parts[2] / 60));
    }
    if (parts.length === 2 && parts.every((n) => !isNaN(n))) {
        return String(parts[0] * 60 + parts[1]);
    }
    return s;
}

// Helper function to write label (bold) and value (normal) on the same line, with wrapping support
function writeLabelValue(doc, label, value, x, y, fontSize = 12) {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", "bold");
    const labelWidth = doc.getTextWidth(label);
    doc.text(label, x, y);
    doc.setFont("helvetica", "normal");
    
    // Calculate available width for value (page width - x position - label width - margin)
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    const availableWidth = pageWidth - x - labelWidth - margin;
    
    // Split value text to fit within available width
    const valueLines = doc.splitTextToSize(value, availableWidth);
    
    // Write first line right after the label
    if (valueLines.length > 0) {
        doc.text(valueLines[0], x + labelWidth, y);
    }
    
    // Write remaining lines below, aligned with where the value starts
    let currentY = y;
    for (let i = 1; i < valueLines.length; i++) {
        currentY += 5; // Line height
        doc.text(valueLines[i], x + labelWidth, currentY);
    }
    
    // Return next Y position (accounting for all lines)
    return currentY + 8;
}

// Helper to draw wrapped paragraph lines with one phrase in bold (e.g. "531 minutes")
function drawLinesWithBoldPhrase(doc, lines, boldPhrase, x, startY, lineHeight) {
    doc.setFont("helvetica", "normal");
    lines.forEach((line, index) => {
        const y = startY + index * lineHeight;
        if (boldPhrase && line.includes(boldPhrase)) {
            const before = line.substring(0, line.indexOf(boldPhrase));
            const after = line.substring(line.indexOf(boldPhrase) + boldPhrase.length);
            doc.setFont("helvetica", "normal");
            doc.text(before, x, y);
            const wBefore = doc.getTextWidth(before);
            doc.setFont("helvetica", "bold");
            doc.text(boldPhrase, x + wBefore, y);
            const wBold = doc.getTextWidth(boldPhrase);
            doc.setFont("helvetica", "normal");
            doc.text(after, x + wBefore + wBold, y);
        } else {
            doc.setFont("helvetica", "normal");
            doc.text(line, x, y);
        }
    });
    doc.setFont("helvetica", "normal");
}

function fillPDF(doc, { selectedCPTs, patient, firstRecord }) {
    let hasDrawnSection = false;
    let billSummaryShown = false;

    // CPT 98975 - Initial Set-Up & Patient Education
    if (selectedCPTs?.includes("98975")) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Remote Therapeutic Monitoring (RTM)", 10, 10);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        let currentY = 18;
        const billingComments = firstRecord?.billing_comments || "";
        currentY = writeLabelValue(doc, "Bill Summary: ", billingComments, 10, currentY, 10);
        currentY += 8;
        billSummaryShown = true;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Initial Set-Up & Patient Education", 10, currentY);
        currentY += 8;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("CPT Code: 98975", 10, currentY);
        currentY += 10;
        const patientName = getPatientName(patient) || firstRecord?.patientName || "";
        currentY = writeLabelValue(doc, "Patient: ", patientName, 10, currentY, 10);
        
        const providerName = getProviderName(patient) || firstRecord?.assignedProvider || "";
        currentY = writeLabelValue(doc, "Assigned Provider: ", providerName, 10, currentY, 10);
        
        currentY += 8;
        
        const rtmPlatform = "Revive Ease — FDA-registered Class I medical device (patient mobile application with web portal access for the care team)";
        currentY = writeLabelValue(doc, "RTM Platform: ", rtmPlatform, 10, currentY, 10);
        
        const setupDate = formatDateOrEmpty(patient?.created_at || patient?.createdAt || firstRecord?.setupDate, "MM/dd/yyyy");
        currentY = writeLabelValue(doc, "Set-Up Date: ", setupDate, 10, currentY, 10);
        
        const firstTransmission = formatDateOrEmpty(firstRecord?.firstSuccessfulDataTransmission || patient?.created_at || patient?.createdAt, "MM/dd/yyyy");
        currentY = writeLabelValue(doc, "First Successful Data Transmission: ", firstTransmission, 10, currentY, 10);
        
        // Add one line gap before Documentation

           currentY += 8;
        doc.setFont("helvetica", "bold");
        doc.text("Documentation", 10, currentY);
        // Add one line gap after Documentation
        currentY += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        
        let docYOffset = currentY;
        const setupDateDoc = formatDateOrEmpty(patient?.created_at || patient?.createdAt || firstRecord?.setupDate, "MMMM dd, yyyy");
        const firstTransmissionDoc = formatDateOrEmpty(firstRecord?.firstSuccessfulDataTransmission || patient?.created_at || patient?.createdAt, "MMMM dd, yyyy");
        
        // Paragraph 1: First two sentences together
        const paragraph1 = `The patient was set up and educated on the use of the Revive Ease mobile application for remote therapeutic monitoring on ${setupDateDoc || "…………"}. Education included account access, platform use, and expectations for entering patient-reported information.`;
        const paragraph1Lines = doc.splitTextToSize(paragraph1, 190);
        paragraph1Lines.forEach((line, index) => {
            doc.text(line, 10, docYOffset + index * 5);
        });
        docYOffset += paragraph1Lines.length * 5 + 5; // Add space after paragraph
        
        // Paragraph 2: Next two sentences together
        const paragraph2 = `The application was activated and verified for data transmission. The first successful data transmission occurred on ${firstTransmissionDoc || ""}`;
        const paragraph2Lines = doc.splitTextToSize(paragraph2, 190);
        paragraph2Lines.forEach((line, index) => {
            doc.text(line, 10, docYOffset + index * 5);
        });
        docYOffset += paragraph2Lines.length * 5 + 5; // Add space after paragraph
        
        // Paragraph 3: Last sentence alone
        const paragraph3 = "Remote therapeutic monitoring via Revive Ease may be utilized as part of the patient's plan of care to support ongoing monitoring and remote communication.";
        const paragraph3Lines = doc.splitTextToSize(paragraph3, 190);
        paragraph3Lines.forEach((line, index) => {
            doc.text(line, 10, docYOffset + index * 5);
        });
        hasDrawnSection = true;
    }
    // CPT 98977 - Data Transmission
    if (selectedCPTs?.includes("98977")) {
        if (hasDrawnSection) doc.addPage();
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Remote Therapeutic Monitoring (RTM)", 10, 10);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        let currentY98977 = 18;
        if (!billSummaryShown) {
            const billingCommentsFirst = firstRecord?.billing_comments || "";
            currentY98977 = writeLabelValue(doc, "Monthly Billing Summary: ", billingCommentsFirst, 10, currentY98977, 10);
            currentY98977 += 8;
            billSummaryShown = true;
        }
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Data Transmission", 10, currentY98977);
        doc.setFontSize(10);
        doc.text("CPT Code: 98977", 10, currentY98977 + 8);
        
        doc.setFontSize(10);
        const patientName = getPatientName(patient) || firstRecord?.patientName || "";
        writeLabelValue(doc, "Patient: ", patientName, 10, currentY98977 + 18, 10);
        
        const providerName = getProviderName(patient) || firstRecord?.assignedProvider || "";
        let currentY = writeLabelValue(doc, "Assigned Provider: ", providerName, 10, currentY98977 + 26, 10);
        
        const rtmPlatform = "Revive Ease — FDA-registered Class I medical device (patient mobile application with web portal access for the care team)";
        currentY = writeLabelValue(doc, "RTM Platform: ", rtmPlatform, 10, currentY, 10);
        
        const billingMonth = firstRecord?.billing_month || firstRecord?.monitoringPeriodMonth || "";
        const extractedYear = getYearFromBillingMonth(billingMonth);
        const billingYear = firstRecord?.billing_year || firstRecord?.monitoringPeriodYear || extractedYear || new Date().getFullYear();
        const monthText = getMonthNameFromBillingMonth(billingMonth);
        const monitoringPeriod = monthText && billingYear ? `${monthText}, ${billingYear}` : firstRecord?.monitoringPeriod || "";
        currentY = writeLabelValue(doc, "Monitoring Period: ", monitoringPeriod, 10, currentY, 10);
        
        // Add one line gap before Documentation
        currentY += 8;
        doc.setFont("helvetica", "bold");
        doc.text("Documentation", 10, currentY);
        // Add one line gap after Documentation
        currentY += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        
        const uniqueDays = firstRecord?.uniqueDays;
        const docText = `During the applicable rolling 30-day monitoring period, the patient actively utilized the Revive Ease mobile application for remote therapeutic monitoring. Patient-reported therapeutic data were successfully transmitted on ${formatUniqueDaysPhrase(uniqueDays)} within this period.`;
        const docLines = doc.splitTextToSize(docText, 190);
        const lineHeight = 6;
        docLines.forEach((line, index) => {
            doc.text(line, 10, currentY + index * lineHeight);
        });
        hasDrawnSection = true;
    }
    // CPT 98980 - Monitoring & Interactive Communication
    if (selectedCPTs?.includes("98980")) {
        if (hasDrawnSection) doc.addPage();      
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Remote Therapeutic Monitoring (RTM)", 10, 10);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        let currentY98980 = 18;
        if (!billSummaryShown) {
            const billingCommentsFirst = firstRecord?.billing_comments || "";
            currentY98980 = writeLabelValue(doc, "Monthly Billing Summary: ", billingCommentsFirst, 10, currentY98980, 10);
            currentY98980 += 8;
            billSummaryShown = true;
        }
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Monitoring & Interactive Communication", 10, currentY98980);
        doc.setFontSize(10);
        doc.text("CPT Code: 98980", 10, currentY98980 + 8);
        
        doc.setFontSize(10);
        const patientName = getPatientName(patient) || firstRecord?.patientName || "";
        writeLabelValue(doc, "Patient: ", patientName, 10, currentY98980 + 18, 10);
        
        const providerName = getProviderName(patient) || firstRecord?.assignedProvider || "";
        let currentY = writeLabelValue(doc, "Assigned Provider: ", providerName, 10, currentY98980 + 26, 10);
        
        const rtmPlatform = "Revive Ease — FDA-registered Class I medical device (patient mobile application with web portal access for the care team)";
        currentY = writeLabelValue(doc, "RTM Platform: ", rtmPlatform, 10, currentY, 10);
        
        const billingMonth98980 = firstRecord?.billing_month || firstRecord?.calendarMonth || "";
        const extractedYear98980 = getYearFromBillingMonth(billingMonth98980);
        const billingYear98980 = firstRecord?.billing_year || firstRecord?.calendarYear || extractedYear98980 || new Date().getFullYear();
        const monthText98980 = getMonthNameFromBillingMonth(billingMonth98980);
        const calendarMonth = monthText98980 && billingYear98980 ? `${monthText98980} ${billingYear98980}` : firstRecord?.calendarMonth || "";
        currentY = writeLabelValue(doc, "Calendar Month: ", calendarMonth, 10, currentY, 10);
        
        // Add one line gap before Documentation
        currentY += 8;
        doc.setFont("helvetica", "bold");
        doc.text("Documentation", 10, currentY);
        // Add one line gap after Documentation
        currentY += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        
        const lineHeight = 6;
        const totalMinutesRaw =  firstRecord?.totaloveralltime  ?? "[XX]";
        const totalMinutes = formatMinutesForDisplay(totalMinutesRaw);
        // Leading space so sentence reads: "a total of  51 minutes"
        const boldMinutesPhrase = ` ${totalMinutes} minutes`;
        const docText1 = `During the calendar month of ${calendarMonth || "[Month Year]"}, a total of ${boldMinutesPhrase} of remote therapeutic monitoring management time occurred as a result of data transmitted through the Revive Ease platform. Time included review of patient-reported data and patient communication.`;
        const docLines1 = doc.splitTextToSize(docText1, 190);
        let docYOffset = currentY + 8;
        drawLinesWithBoldPhrase(doc, docLines1, boldMinutesPhrase, 10, docYOffset, lineHeight);
        docYOffset += docLines1.length * lineHeight + 6; // Add gap after first paragraph
        
        const docText2 = "At least one synchronous interaction occurred during this period to review patient-reported data and provide supportive guidance related to platform use and self-management.";
        const docLines2 = doc.splitTextToSize(docText2, 190);
        docLines2.forEach((line, index) => {
            doc.text(line, 10, docYOffset + index * lineHeight);
        });
        
        let yOffset = docYOffset + docLines2.length * lineHeight + 10;
        
        // Synchronous Interaction Summary — bullet list with left padding, no extra line space
        const bulletIndent = 22;
        const bulletGap = 5;
        doc.setFont("helvetica", "bold");
        doc.text("Synchronous Interaction Summary", 10, yOffset);
        yOffset += 10;
        
        const callEntries = [];
        firstRecord?.callDetails?.forEach((session) => {
            if (session.call_logs?.length > 0) {
                session.call_logs.forEach((log) => {
                    callEntries.push({
                        date: formatDateOrEmpty(log.called_on, "MM/dd/yyyy"),
                        timestamp: log?.called_on ? new Date(log.called_on).getTime() : 0,
                        mode: log.mode || firstRecord?.interactionMode || "Call",
                        duration: log.duration ? `${Math.floor(log.duration / 60)}` : firstRecord?.interactionDuration || "[X]",
                        summary: log?.chart_notes || log.summary || firstRecord?.interactionSummary || "No Summary Available",
                    });
                });
            } else if (session.call_time > 0) {
                callEntries.push({
                    date: formatDateOrEmpty(session.session_date, "MM/dd/yyyy"),
                        timestamp: session?.session_date ? new Date(session.session_date).getTime() : 0,
                    mode: session.mode || firstRecord?.interactionMode || "Call",
                    duration: session.call_time ? `${Math.floor(session.call_time / 60)}` : firstRecord?.interactionDuration || "[X]",
                    summary: session.summary || firstRecord?.interactionSummary || "No Summary Available",
                });
            }
        });
        
        // If no call entries, show at least one placeholder
        if (callEntries.length === 0) {
            callEntries.push({
                date: firstRecord?.interactionDate || "[MM/DD/YYYY]",
                timestamp: firstRecord?.interactionDate ? new Date(firstRecord.interactionDate).getTime() : 0,
                mode: firstRecord?.interactionMode || "Call",
                duration: firstRecord?.interactionDuration || "[X]",
                summary: firstRecord?.interactionSummary || "[Selected from approved summary library]",
            });
        }
        
        // Sort interactions by date (oldest first)
        callEntries.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        callEntries.forEach((entry) => {
            if (yOffset > 270) {
                doc.addPage();
                yOffset = 20;
            }
            doc.text("•", bulletIndent, yOffset);
            let nextY = writeLabelValue(doc, "Date: ", entry.date, bulletIndent + bulletGap, yOffset, 10);
            yOffset = nextY;
            doc.text("•", bulletIndent, yOffset);
            nextY = writeLabelValue(doc, "Mode: ", entry.mode, bulletIndent + bulletGap, yOffset, 10);
            yOffset = nextY;
            doc.text("•", bulletIndent, yOffset);
            nextY = writeLabelValue(doc, "Duration: ", `${entry.duration} minutes`, bulletIndent + bulletGap, yOffset, 10);
            yOffset = nextY;
            doc.text("•", bulletIndent, yOffset);
            nextY = writeLabelValue(doc, "Summary: ", entry.summary, bulletIndent + bulletGap, yOffset, 10);
            yOffset = nextY;
            // Add one line space after each interaction block
            yOffset += 5;
        });
        hasDrawnSection = true;
    }
    // CPT 98981 - Additional Monitoring Time
    if (selectedCPTs?.includes("98981")) {
        if (hasDrawnSection) doc.addPage();
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Remote Therapeutic Monitoring (RTM)", 10, 10);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        let currentY98981 = 18;
        if (!billSummaryShown) {
            const billingCommentsFirst = firstRecord?.billing_comments || "";
            currentY98981 = writeLabelValue(doc, "Monthly Billing Summary: ", billingCommentsFirst, 10, currentY98981, 10);
            currentY98981 += 8;
            billSummaryShown = true;
        }
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Additional Monitoring Time", 10, currentY98981);
        doc.setFontSize(10);
        doc.text("CPT Code: 98981 (Add-on to 98980)", 10, currentY98981 + 8);
        
        doc.setFontSize(10);
        const patientName = getPatientName(patient) || firstRecord?.patientName || "";
        writeLabelValue(doc, "Patient: ", patientName, 10, currentY98981 + 18, 10);
        
        const providerName = getProviderName(patient) || firstRecord?.assignedProvider || "";
        let currentY = writeLabelValue(doc, "Assigned Provider: ", providerName, 10, currentY98981 + 26, 10);
        
        const rtmPlatform = "Revive Ease — FDA-registered Class I medical device (patient mobile application with web portal access for the care team)";
        currentY = writeLabelValue(doc, "RTM Platform: ", rtmPlatform, 10, currentY, 10);
        
        const billingMonth98981 = firstRecord?.billing_month || firstRecord?.calendarMonth || "";
        const extractedYear98981 = getYearFromBillingMonth(billingMonth98981);
        const billingYear98981 = firstRecord?.billing_year || firstRecord?.calendarYear || extractedYear98981 || new Date().getFullYear();
        const monthText98981 = getMonthNameFromBillingMonth(billingMonth98981);
        const calendarMonth = monthText98981 && billingYear98981 ? `${monthText98981} ${billingYear98981}` : firstRecord?.calendarMonth || "";
        currentY = writeLabelValue(doc, "Calendar Month: ", calendarMonth, 10, currentY, 10);
        
        // Add one line gap before Documentation
        currentY += 8;
        doc.setFont("helvetica", "bold");
        doc.text("Documentation", 10, currentY);
        // Add one line gap after Documentation
        currentY += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        
        const lineHeight = 6;
        
        // Get additional minutes from cptReport criteria (as per old code)
        // Extract only the number from criteria (e.g., "Extra time: 429 mins" -> "429")
        const criteria = firstRecord?.cptReport?.find(c => c.code === "98981")?.criteria || "";
        let minutesText = "[—]";
        if (criteria) {
            // Extract number from criteria string (e.g., "Extra time: 429 mins" -> 429)
            const numberMatch = criteria.match(/\d+/);
            if (numberMatch) {
                minutesText = numberMatch[0];
            }
        }
        // Concatenate text: textBefore + textBold + textAfter (no extra spaces)
        const textBefore = `During the calendar month of ${calendarMonth || "—-----"}, an `;
        const textBold = `additional ${minutesText} minutes`;
        const textAfter = `of remote therapeutic monitoring management time occurred beyond the time billed under CPT 98980. This time was spent reviewing patient-reported data and engaging in RTM-related patient communication through the Revive Ease platform.`;
        
        // Full text for wrapping calculation (no extra spaces - direct concatenation)
        const fullText = textBefore + textBold + " " + textAfter;
        
        let docYOffset = currentY + 2;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const maxWidth = 190;
        let currentX = 10;
        let currentYPos = docYOffset;
        
        // Find where bold text starts and ends in the full text
        const boldStartIndex = textBefore.length;
        const boldEndIndex = boldStartIndex + textBold.length;
        
        // Split full text to see how it wraps
        const allLines = doc.splitTextToSize(fullText, maxWidth);
        
        // Write each line, making the bold part bold
        allLines.forEach((line, lineIndex) => {
            if (lineIndex > 0) {
                currentYPos += lineHeight;
                currentX = 10;
            }
            
            // Calculate character positions for this line in the full text
            let lineStartChar = 0;
            for (let i = 0; i < lineIndex; i++) {
                lineStartChar += allLines[i].length;
            }
            let lineEndChar = lineStartChar + line.length;
            
            // Check if bold text is in this line
            if (boldEndIndex > lineStartChar && boldStartIndex < lineEndChar) {
                // Bold text spans this line (or part of it)
                const beforeBoldInLine = Math.max(0, boldStartIndex - lineStartChar);
                const boldInLineStart = Math.max(0, boldStartIndex - lineStartChar);
                const boldInLineEnd = Math.min(line.length, boldEndIndex - lineStartChar);
                
                // Write part before bold
                if (beforeBoldInLine > 0) {
                    const beforePart = line.substring(0, beforeBoldInLine);
                    doc.setFont("helvetica", "normal");
                    doc.text(beforePart, currentX, currentYPos);
                    currentX += doc.getTextWidth(beforePart);
                }
                
                // Write bold part
                if (boldInLineEnd > boldInLineStart) {
                    const boldPart = line.substring(boldInLineStart, boldInLineEnd);
                    doc.setFont("helvetica", "bold");
                    doc.text(boldPart, currentX, currentYPos);
                    currentX += doc.getTextWidth(boldPart);
                }
                
                // Write part after bold
                if (boldInLineEnd < line.length) {
                    const afterPart = line.substring(boldInLineEnd);
                    doc.setFont("helvetica", "normal");
                    doc.text(afterPart, currentX, currentYPos);
                }
            } else {
                // No bold text in this line, write normally
                doc.setFont("helvetica", "normal");
                doc.text(line, currentX, currentYPos);
            }
        });
        hasDrawnSection = true;
    }
    // CPT 98979 - Monitoring & Interactive Communication (10-19 minutes)
    if (selectedCPTs?.includes("98979")) {
        if (hasDrawnSection) doc.addPage();
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Remote Therapeutic Monitoring (RTM)", 10, 10);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        let currentY98979 = 18;
        if (!billSummaryShown) {
            const billingCommentsFirst = firstRecord?.billing_comments || "";
            currentY98979 = writeLabelValue(doc, "Bill Summary: ", billingCommentsFirst, 10, currentY98979, 10);
            currentY98979 += 8;
            billSummaryShown = true;
        }
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Monitoring & Interactive Communication", 10, currentY98979);
        doc.setFontSize(10);
        doc.text("CPT Code: 98979", 10, currentY98979 + 8);
        
        doc.setFontSize(10);
        const patientName = getPatientName(patient) || firstRecord?.patientName || "";
        writeLabelValue(doc, "Patient: ", patientName, 10, currentY98979 + 18, 10);
        
        const providerName = getProviderName(patient) || firstRecord?.assignedProvider || "";
        let currentY = writeLabelValue(doc, "Assigned Provider: ", providerName, 10, currentY98979 + 26, 10);
        
        const billingMonth98979 = firstRecord?.billing_month || firstRecord?.calendarMonth || "";
        const extractedYear98979 = getYearFromBillingMonth(billingMonth98979);
        const billingYear98979 = firstRecord?.billing_year || firstRecord?.calendarYear || extractedYear98979 || new Date().getFullYear();
        const monthText98979 = getMonthNameFromBillingMonth(billingMonth98979);
        const calendarMonth = monthText98979 && billingYear98979 ? `${monthText98979} ${billingYear98979}` : firstRecord?.calendarMonth || "";
        currentY = writeLabelValue(doc, "Calendar Month: ", calendarMonth, 10, currentY, 10);
        
        const rtmPlatform = "Revive Ease — FDA-registered Class I medical device (patient mobile application with web portal access for the care team)";
        currentY = writeLabelValue(doc, "RTM Platform: ", rtmPlatform, 10, currentY, 10);
        
        // Add one line gap before Documentation
        currentY += 8;
        doc.setFont("helvetica", "bold");
        doc.text("Documentation", 10, currentY);
        // Add one line gap after Documentation
        currentY += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        
        const totalMinutesRaw = firstRecord?.totalMinutes ?? firstRecord?.totaloveralltime ?? firstRecord?.totalmonitoringtime ?? "[XX]";
        const totalMinutes = formatMinutesForDisplay(totalMinutesRaw);
        // Leading space so sentence reads: "a total of  51 minutes"
        const boldMinutesPhrase = ` ${totalMinutes} minutes`;
        const docText1 = `During the calendar month of ${calendarMonth || "[Month Year]"}, a total of ${boldMinutesPhrase} of remote therapeutic monitoring management time occurred as a result of data transmitted through the Revive Ease platform. Time included review of patient-reported data and patient communication.`;
        const docLines1 = doc.splitTextToSize(docText1, 190);
        let docYOffset = currentY;
        const lineHeight98979 = 5;
        drawLinesWithBoldPhrase(doc, docLines1, boldMinutesPhrase, 10, docYOffset, lineHeight98979);
        docYOffset += docLines1.length * lineHeight98979 + 5; // Add one line gap after first paragraph
        
        const docText2 = "At least one synchronous interaction occurred during this period to review patient-reported data and provide supportive guidance related to platform use and self-management.";
        const docLines2 = doc.splitTextToSize(docText2, 190);
        docLines2.forEach((line, index) => {
            doc.text(line, 10, docYOffset + index * 5);
        });
        
        let yOffset = docYOffset + docLines2.length * 5 + 10;
        
        // Synchronous Interaction Summary — bullet list with left padding, no extra line space
        const bulletIndent = 22;
        const bulletGap = 5;
        doc.setFont("helvetica", "bold");
        doc.text("Synchronous Interaction Summary", 10, yOffset);
        yOffset += 10;
        
        const callEntries = [];
        firstRecord?.callDetails?.forEach((session) => {
            if (session.call_logs?.length > 0) {
                session.call_logs.forEach((log) => {
                    callEntries.push({
                        date: formatDateOnly(log.called_on),
                        timestamp: log?.called_on ? new Date(log.called_on).getTime() : 0,
                        mode: log.mode || firstRecord?.interactionMode || "Call",
                        duration: log.duration ? `${Math.floor(log.duration / 60)}` : firstRecord?.interactionDuration || "[X]",
                        summary: log.chart_notes     || log.summary || firstRecord?.interactionSummary || "[Selected from approved summary sentence library]",
                    });
                });
            } else if (session.call_time > 0) {
                callEntries.push({
                    date: formatDateOnly(session.session_date),
                        timestamp: session?.session_date ? new Date(session.session_date).getTime() : 0,
                    mode: session.mode || firstRecord?.interactionMode || "Call",
                    duration: session.call_time ? `${Math.floor(session.call_time / 60)}` : firstRecord?.interactionDuration || "[X]",
                    summary: session.summary || firstRecord?.interactionSummary || "[Selected from approved summary sentence library]",
                });
            }
        });
        
        // If no call entries, show at least one placeholder
        if (callEntries.length === 0) {
            callEntries.push({
                date: firstRecord?.interactionDate || "[MM/DD/YYYY]",
                timestamp: firstRecord?.interactionDate ? new Date(firstRecord.interactionDate).getTime() : 0,
                mode: firstRecord?.interactionMode || "Call",
                duration: firstRecord?.interactionDuration || "[X]",
                summary: firstRecord?.interactionSummary || "[Selected from approved summary sentence library]",
            });
        }
        
        // Sort interactions by date (oldest first)
        callEntries.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        callEntries.forEach((entry) => {
            if (yOffset > 270) {
                doc.addPage();
                yOffset = 20;
            }
            doc.text("•", bulletIndent, yOffset);
            let nextY = writeLabelValue(doc, "Date: ", entry.date, bulletIndent + bulletGap, yOffset, 10);
            yOffset = nextY;
            doc.text("•", bulletIndent, yOffset);
            nextY = writeLabelValue(doc, "Mode: ", entry.mode, bulletIndent + bulletGap, yOffset, 10);
            yOffset = nextY;
            doc.text("•", bulletIndent, yOffset);
            nextY = writeLabelValue(doc, "Duration: ", `${entry.duration} minutes`, bulletIndent + bulletGap, yOffset, 10);
            yOffset = nextY;
            doc.text("•", bulletIndent, yOffset);
            nextY = writeLabelValue(doc, "Summary: ", entry.summary, bulletIndent + bulletGap, yOffset, 10);
            yOffset = nextY;
            // Add one line space after each interaction block
            yOffset += 5;
        });
        
        // Add note at the end
        yOffset += 5;
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        const noteText = "\"Time included review of patient-reported data and care team communication with the patient.\"";
        doc.text(noteText, 10, yOffset);
        hasDrawnSection = true;
    }
    // CPT 98985 - Data Transmission (2-15 days)
    if (selectedCPTs?.includes("98985")) {
        if (hasDrawnSection) doc.addPage();
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Remote Therapeutic Monitoring (RTM)", 10, 10);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        let currentY98985 = 18;
        if (!billSummaryShown) {
            const billingCommentsFirst = firstRecord?.billing_comments || "";
            currentY98985 = writeLabelValue(doc, "Bill Summary: ", billingCommentsFirst, 10, currentY98985, 10);
            currentY98985 += 8;
            billSummaryShown = true;
        }
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Data Transmission", 10, currentY98985);
        doc.setFontSize(10);
        doc.text("CPT Code: 98985", 10, currentY98985 + 8);
        
        doc.setFontSize(10);
        const patientName = getPatientName(patient) || firstRecord?.patientName || "";
        writeLabelValue(doc, "Patient: ", patientName, 10, currentY98985 + 18, 10);
        
        const providerName = getProviderName(patient) || firstRecord?.assignedProvider || "";
        let currentY = writeLabelValue(doc, "Assigned Provider: ", providerName, 10, currentY98985 + 26, 10);
        
        const rtmPlatform = "Revive Ease — FDA-registered Class I medical device (patient mobile application with web portal access for the care team)";
        currentY = writeLabelValue(doc, "RTM Platform: ", rtmPlatform, 10, currentY, 10);
        
        const billingMonth98985 = firstRecord?.billing_month || firstRecord?.monitoringPeriodMonth || "";
        const extractedYear98985 = getYearFromBillingMonth(billingMonth98985);
        const billingYear98985 = firstRecord?.billing_year || firstRecord?.monitoringPeriodYear || extractedYear98985 || new Date().getFullYear();
        const monthText98985 = getMonthNameFromBillingMonth(billingMonth98985);
        const monitoringPeriod = monthText98985 && billingYear98985 ? `${monthText98985}, ${billingYear98985}` : firstRecord?.monitoringPeriod || "";
        currentY = writeLabelValue(doc, "Monitoring Period: ", monitoringPeriod, 10, currentY, 10);
        
        // Add one line gap before Documentation
        currentY += 8;
        doc.setFont("helvetica", "bold");
        doc.text("Documentation", 10, currentY);
        // Add one line gap after Documentation
        currentY += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        
        const uniqueDays = firstRecord?.uniqueDays;
        const docText = `During the applicable rolling 30-day monitoring period, the patient actively utilized the Revive Ease mobile application for remote therapeutic monitoring. Patient-reported therapeutic data were successfully transmitted on ${formatUniqueDaysPhrase(uniqueDays)} within this period.`;
        const docLines = doc.splitTextToSize(docText, 190);
        let docYOffset = currentY;
        docLines.forEach((line, index) => {
            doc.text(line, 10, docYOffset + index * 5);
        });
        hasDrawnSection = true;
    }
}

const DownloadPDF = ({ selectedCPTs, patient, firstRecord, btnFlag }) => {
    const downloadPDF = () => {
        generatePDF({ selectedCPTs, patient, firstRecord });
    };
    return (
        <button
            className={`btn ${btnFlag ? "download-pdf" : "add-practs-btn"} fw-bold mx-2`}
            onClick={downloadPDF}
            disabled={selectedCPTs?.length === 0}
        >
            Download as PDF
        </button>
    );
};

export default DownloadPDF;
