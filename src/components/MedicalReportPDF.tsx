import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
interface PatientData {
  name: string;
  id: string;
  age: number;
  course: string;
  date: string;
  time: string;
  designation: string;
  residenceType: string;
  sex: string;
  meds: Array<{
    name: string;
    dosageMorning: string;
    dosageAfternoon: string;
    dosageEvening: string;
    duration: string;
    suggestion: string;
  }>;
}

interface MedicalReportProps {
  ndata: PatientData;
  diagnosis: string;
  dietaryRemarks: string;
  testNeeded: string;
  doctorName: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    width: 60,
    height: "auto",
  },
  title: {
    fontSize: 24,
    fontWeight: "medium",
    textAlign: "center",
  },
  dateTimeContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  dateTime: {
    fontSize: 12,
    fontWeight: "medium",
  },
  horizontalLine: {
    borderBottom: "1 solid black",
    marginTop: 8,
  },
  infoSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginTop:8,
  },
  infoColumn: {
    flex: 1,
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: "medium",
    width: 60,
    whiteSpace: "nowrap",
  },
  input: {
    backgroundColor: "#dddce2",
    padding: 8,
    borderRadius: 4,
    fontSize: 12,
    flex: 1,
    width: 40,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    marginTop: 16,
    fontSize: 12,
    fontWeight: "semibold",
  },
  textarea: {
    backgroundColor: "#dddce2",
    padding: 16,
    borderRadius: 4,
    minHeight: 60,
    fontSize: 12,
  },
  table: {
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1 solid black",
  },
  tableHeaderCell: {
    padding: 8,
    fontSize: 12,
    fontWeight: "medium",
    borderRight: "1 solid black",
    borderTop: "1 solid black",
    backgroundColor: "#FFFFFF",
    textAlign: "center"
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid black",
  },
  tableCell: {
    padding: 8,
    fontSize: 12,
    borderRight: "1 solid black",
    backgroundColor: "#FFFFFF",
  },
  dosageTable: {
    width: "100%",
  },
  dosageHeader: {
    flexDirection: "row",
    borderBottom: "1 solid black",
  },
  dosageHeaderCell: {
    flex: 1,
    padding: 8,
    fontSize: 11,
    fontWeight: "medium",
    textAlign: "center",
    borderRight: "1 solid black",
  },
  dosageRow: {
    flexDirection: "row",
  },
  dosageCell: {
    flex: 1,
    padding: 8,
    fontSize: 11,
    textAlign: "center",
    borderRight: "1 solid black",
  },
  signature: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  signatureName: {
    fontSize: 12,
  },
  signatureDesignation: {
    fontSize: 12,
  },
  signatureTitle: {
    fontSize: 12,
    fontWeight: "bold",
  },
});

const MedicalReportPDF: React.FC<MedicalReportProps> = ({
  ndata,
  diagnosis,
  dietaryRemarks,
  testNeeded,
  doctorName,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Image src="/upes-logo.jpg" style={styles.logo} />
        <Text style={styles.title}>UHS</Text>
        <View style={styles.dateTimeContainer}>
          <Text style={styles.dateTime}>{ndata?.time}</Text>
          <Text style={styles.dateTime}>{ndata?.date}</Text>
        </View>
      </View>

      <View style={styles.horizontalLine} />

      <View style={styles.infoSection}>
        <View style={styles.infoColumn}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.input}>{ndata?.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>ID:</Text>
            <Text style={styles.input}>{ndata?.id}</Text>
          </View>
        </View>

        <View style={styles.infoColumn}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Age:</Text>
            <Text style={styles.input}>{ndata?.age}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>School:</Text>
            <Text style={styles.input}>{ndata?.course}</Text>
          </View>
        </View>

        <View style={styles.infoColumn}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Sex:</Text>
            <Text style={styles.input}>{ndata?.sex}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Residence Type:</Text>
            <Text style={styles.input}>{ndata?.residenceType}</Text>
          </View>
        </View>
      </View>

      <View style={styles.horizontalLine} />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Diagnosis:</Text>
        <Text style={styles.textarea}>{diagnosis}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Medicine:</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: "9%", borderLeft: "1 solid black" }]}>
              S. No.
            </Text>
            <Text style={[styles.tableHeaderCell, { width: "24%" }]}>
              Medicine
            </Text>
            <Text style={[styles.tableHeaderCell, { width: "35%" }]}>
              Dosage (/day)
            </Text>
            <Text style={[styles.tableHeaderCell, { width: "12%" }]}>
              Duration
            </Text>
            <Text
              style={[styles.tableHeaderCell, { width: "20%"}]}
            >
              Suggestions
            </Text>
          </View>

          {ndata.meds.map((med, index) => (
            <View key={index} style={styles.tableRow}>
              <Text
                style={[styles.tableCell, { width: "9%", textAlign: "center", borderLeft: "1 solid black" }]}
              >
                {index + 1}
              </Text>
              <Text style={[styles.tableCell, { width: "24%" }]}>
                {med.name}
              </Text>
              <View style={[styles.tableCell, { width: "35%", padding: 0 }]}>
                <View style={styles.dosageTable}>
                  <View style={styles.dosageHeader}>
                    <Text style={styles.dosageHeaderCell}>Morning</Text>
                    <Text style={styles.dosageHeaderCell}>Afternoon</Text>
                    <Text style={[styles.dosageHeaderCell, { borderRight: 0 }]}>
                      Evening
                    </Text>
                  </View>
                  <View style={styles.dosageRow}>
                    <Text style={styles.dosageCell}>{med.dosageMorning}</Text>
                    <Text style={styles.dosageCell}>{med.dosageAfternoon}</Text>
                    <Text style={[styles.dosageCell, { borderRight: 0 }]}>
                      {med.dosageEvening}
                    </Text>
                  </View>
                </View>
              </View>
              <Text
                style={[
                  styles.tableCell,
                  { width: "12%", textAlign: "center" },
                ]}
              >
                {med.duration}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  { width: "20%" },
                ]}
              >
                {med.suggestion}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Recommendations:</Text>
        <Text style={styles.textarea}>{dietaryRemarks}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Tests Needed:</Text>
        <Text style={styles.textarea}>{testNeeded}</Text>
      </View>

      <View style={styles.signature}>
        <Text style={styles.signatureName}>{doctorName}</Text>
        <Text style={styles.signatureDesignation}>({ndata?.designation})</Text>
        <Text style={styles.signatureTitle}>Doctor</Text>
      </View>
    </Page>
  </Document>
);

export default MedicalReportPDF;
