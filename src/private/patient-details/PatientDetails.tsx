import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ToastAction } from "@/components/ui/toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PatientDetails = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [diagnosis, setDiagnosis] = useState<string>();
  const [dietary, setDietary] = useState<string>();
  const [tests, setTests] = useState<string>();
  const [medLst, setMedLst] = useState<Record<number, string>>();
  // const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [rows, setRows] = useState([1]);
  const [ndata, setNdata] = useState<{
    name: string;
    age: number;
    sex: string;
    id: string;
    course: string;
    medHis: string;
    famHis: string;
    allergies: string;
    reason: string;
    email: string;
    imageUrl: string;
    docName: string;
    height: string;
    weight: string;
    date: string;
    time: string;
    designation: string;
    temp: number;
    residenceType: string;
  }>();
  const [stock, setStock] = useState<
    Array<{ id: string; medicineName: string; quantity: number }>
  >([]);
  const [selectedMedicine, setSelectedMedicine] = useState<
    Record<number, string>
  >({});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const age = (dob: string) => {
    const diff_ms = Date.now() - new Date(dob).getTime();
    const age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  };

  const handleSubmit = async () => {
    const medAry: any = new Array<{
      medicine: any;
      dosage: any;
      duration: any;
      suggestion: any;
    }>();

    const dosgM = document.querySelectorAll(".dosage-morning");
    const dosgA = document.querySelectorAll(".dosage-afternoon");
    const dosgE = document.querySelectorAll(".dosage-evening");
    const dur = document.querySelectorAll(".duration");
    const sugs = document.querySelectorAll(".suggestion");

    for (const meds in medLst) {
      medAry.push({
        medicine: medLst[parseInt(meds)],
        dosageMorning: (dosgM[parseInt(meds)] as HTMLInputElement).value || 0,
        dosageAfternoon: (dosgA[parseInt(meds)] as HTMLInputElement).value || 0,
        dosageEvening: (dosgE[parseInt(meds)] as HTMLInputElement).value || 0,
        duration: (dur[parseInt(meds)] as HTMLInputElement).value || 0,
        suggestion: (sugs[parseInt(meds)] as HTMLInputElement).value || "",
      });
    }
    const req: {
      diagnosis: string;
      dietaryRemarks: string;
      testNeeded: string;
      meds: any;
    } = {
      diagnosis: diagnosis || "",
      dietaryRemarks: dietary || "",
      testNeeded: tests || "",
      meds: medAry,
    };

    try {
      const resp = await axios.post(
        "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/doctor/prescription/submit",
        req,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast({
        title: "Success",
        description: resp.data,
      });
      navigate("/doctor-dashboard");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          err.response?.data?.message || "An error occurred. Please try again.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
      console.error(err);
    }
  };

  // const toggleRowSelection = (rowIndex: number) => {
  //   setSelectedRows((prevSelected) =>
  //     prevSelected.includes(rowIndex)
  //       ? prevSelected.filter((index) => index !== rowIndex)
  //       : [...prevSelected, rowIndex]
  //   );
  // };

  // const removeSelectedRows = () => {
  //   const updatedRows = rows.filter(
  //     (_, index) => !selectedRows.includes(index)
  //   );
  //   setRows(updatedRows);
  //   setSelectedRows([]);
  // };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await axios.get(
          "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/doctor/getPatient",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const response = resp.data;

        const formatData = {
          name: response.patient.name,
          age: age(response.patient.dateOfBirth),
          sex: response.patient.gender,
          id: response.patient.sapID,
          course: response.patient.school,
          medHis: response.medicalDetails.medicalHistory,
          famHis: response.medicalDetails.familyMedicalHistory,
          allergies: response.medicalDetails.allergies,
          reason: response.reason,
          email: response.patient.email,
          imageUrl: response.patient.imageUrl,
          docName: response.docName,
          height: response.medicalDetails.height,
          weight: response.medicalDetails.weight,
          temp: response.temp,
          designation: response.designation,
          date: response.date,
          time: response.time,
          residenceType: response.medicalDetails.residenceType,
        };
        setNdata(formatData);
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            err.response?.data?.message ||
            "An error occurred while fetching patient data.",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
        console.error(err);
      }
    };

    const fetchMed = async () => {
      const latitude = localStorage.getItem("latitude");
      const longitude = localStorage.getItem("longitude");

      if (!(latitude || longitude)) {
        return;
      }

      try {
        const resp = await axios.get(
          `http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/doctor/stock/available`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "X-Latitude": latitude,
              "X-Longitude": longitude,
            },
          }
        );

        const response = resp.data;
        setStock(response);
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            err.response?.data?.message ||
            "An error occurred while fetching stock data.",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
        console.error(err);
      }
    };

    fetchData();
    fetchMed();
  }, []);

  const addRow = () => {
    setRows([...rows, rows.length + 1]);
  };

  const removeRow = () => {
    if (rows.length > 0) {
      setRows(rows.slice(0, -1));
    }
  };

  const handleMedicineSelect = (index: number, medicine: string) => {
    const indx = medicine.indexOf(":");
    setSelectedMedicine({
      ...selectedMedicine,
      [index]: medicine.substring(0, indx),
    });
    setMedLst({ ...medLst, [index]: medicine.substring(indx + 1) });

    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleRelease = async () => {
    try {
      const resp = await axios.get(
        "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/doctor/releasePatient",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast({
        title: "Patient Released",
        description: resp.data.message || "Patient released successfully.",
      });
      navigate(-1);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          err.response?.data?.message ||
          "An error occurred while releasing the patient.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
      console.error(err);
    }
  };

  return (
    <>
      <Toaster />
      <div className="overflow-y-scroll min-h-[84svh] p-4 bg-[#ECECEC] max-lg:min-h-[93svh] max-lg:p-2">
        <div className="flex justify-between mb-4 max-lg:flex-col max-lg:items-center">
          <div className="flex justify-center items-center w-[25%] max-lg:w-[50%] max-lg:mb-4">
            <img
              className="border-black border-[1.5px] shadow-lg"
              src={
                ndata?.imageUrl != null
                  ? `http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/${ndata?.imageUrl}`
                  : "/default-user.jpg"
              }
            />
          </div>
          <div className="w-full flex px-4 justify-between lg:gap-4 max-lg:flex-col">
            <div className="flex flex-col w-[50%] justify-between max-lg:gap-5 max-lg:mb-5 max-lg:w-full">
              <div className="flex items-center w-full">
                <label className="w-[20%] font-medium max-lg:w-[70%]">
                  Name:
                </label>
                <input
                  className="rounded-md bg-white p-2 shadow-md w-full"
                  type="text"
                  value={ndata?.name}
                  disabled
                />
              </div>
              <div className="flex items-center w-full">
                <label className="w-[20%] font-medium max-lg:w-[70%]">
                  Age:
                </label>
                <input
                  className="rounded-md bg-white p-2 shadow-md w-full"
                  type="text"
                  value={ndata?.age}
                  disabled
                />
              </div>
              <div className="flex items-center w-full">
                <label className="w-[20%] font-medium max-lg:w-[70%]">
                  Sex:
                </label>
                <input
                  className="rounded-md bg-white p-2 shadow-md w-full"
                  type="text"
                  value={ndata?.sex}
                  disabled
                />
              </div>
              <div className="flex items-center w-full">
                <label className="w-[20%] font-medium max-lg:w-[70%]">
                  SAP Id:
                </label>
                <input
                  className="rounded-md bg-white p-2 shadow-md w-full"
                  type="text"
                  value={ndata?.id}
                  disabled
                />
              </div>
              <div className="flex items-center w-full">
                <label className="w-[20%] font-medium max-lg:w-[70%]">
                  School:
                </label>
                <input
                  className="rounded-md bg-white p-2 shadow-md w-full"
                  type="text"
                  value={ndata?.course}
                  disabled
                />
              </div>
            </div>

            <div className="flex flex-col w-[50%] gap-3 max-lg:w-full max-lg:mb-5">
              <div className="gap-5 flex flex-col">
                <div className="flex items-center w-full">
                  <label className="font-medium w-[60%] max-lg:w-[70%]">
                    Height (in cm):
                  </label>
                  <input
                    className="w-full p-2 bg-white rounded shadow-md"
                    type="text"
                    value={ndata?.height}
                    disabled
                  />
                </div>
                <div className="flex items-center w-full">
                  <label className="font-medium w-[60%] max-lg:w-[70%]">
                    Weight (in kg):
                  </label>
                  <input
                    className="w-full p-2 bg-white rounded shadow-md"
                    type="text"
                    value={ndata?.weight}
                    disabled
                  />
                </div>
                <div className="flex items-center w-full">
                  <label className="font-medium w-[60%] max-lg:w-[70%]">
                    Temperature (in °F):
                  </label>
                  <input
                    className="w-full p-2 bg-white rounded shadow-md"
                    type="text"
                    value={ndata?.temp}
                    disabled
                  />
                </div>
              </div>

              <label className="font-medium  lg:hidden">Address Type:</label>
              <textarea
                className="h-full p-2 bg-white text-black shadow-md rounded-md lg:hidden"
                disabled
                value={ndata?.residenceType}
              ></textarea>
              <label className="font-medium  lg:hidden">Medical History:</label>
              <textarea
                className="h-full p-2 bg-white text-black shadow-md rounded-md lg:hidden"
                disabled
                value={ndata?.medHis}
              ></textarea>
              <label className="font-medium  lg:hidden">Family History:</label>
              <textarea
                className="h-full p-2 bg-white text-black shadow-md rounded-md  lg:hidden"
                disabled
                value={ndata?.famHis}
              ></textarea>
              <label className="font-medium  lg:hidden">Allergies:</label>
              <textarea
                className="h-full p-2 bg-white text-black shadow-md rounded-md  lg:hidden"
                disabled
                value={ndata?.allergies}
              ></textarea>
              <label className="font-medium">Reason for Visit:</label>
              <textarea
                className="h-full p-2 bg-white text-black shadow-md rounded-md"
                disabled
                value={ndata?.reason}
              ></textarea>
            </div>
          </div>
          <div className="flex flex-col justify-between items-center gap-4 w-[30%] max-lg:w-[100%]">
            <Popover>
              <PopoverTrigger className="bg-[#008080] w-full p-3 text-white rounded-md cursor-pointer max-lg:hidden">
                Address Type
              </PopoverTrigger>
              <PopoverContent>{ndata?.medHis}</PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger className="bg-[#008080] w-full p-3 text-white rounded-md cursor-pointer max-lg:hidden">
                Medical History
              </PopoverTrigger>
              <PopoverContent>{ndata?.medHis}</PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger className="bg-[#008080] w-full p-3 text-white rounded-md cursor-pointer max-lg:hidden">
                Family Medical History
              </PopoverTrigger>
              <PopoverContent>{ndata?.famHis}</PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger
                className={`w-full p-3 rounded-md cursor-pointer ${
                  ndata?.allergies === "Yes" ? "bg-red-500" : "bg-[#008080]"
                } text-white`}
              >
                Allergies
              </PopoverTrigger>

              <PopoverContent>{ndata?.allergies}</PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger
                className="bg-[#008080] w-full p-3 text-white rounded-md cursor-pointer"
                onClick={() =>
                  navigate(
                    `/patient-assigned-prescription?id=${ndata?.email.replace(
                      /@.*?\./g,
                      (match) => match.replace(/\./g, ",")
                    )}`
                  )
                }
              >
                Consultations
              </PopoverTrigger>
            </Popover>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center max-lg:px-0">
          <div className="bg-[#fdfdfd] p-4 w-full border-black border max-lg:p-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex center">
                <img src="/upes-logo.jpg" alt="Logo" className="w-[100px]" />
              </div>
              <h2 className="font-medium text-center text-2xl">UHS</h2>
              <div className="font-medium flex flex-col lg:flex-row items-center max-lg:text-sm ">
                <span>{ndata?.time}</span>
                <span className="lg:ml-2">{ndata?.date}</span>
              </div>
            </div>
            <hr className="border border-black my-2" />
            <div className="my-4">
              <div className="flex justify-between max-lg:flex-col max-lg:gap-4">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-[10px]">
                    <label className="mr-auto font-medium">Name:</label>
                    <input
                      type="text"
                      value={ndata?.name}
                      className="bg-[#dddce2] p-2 rounded-md"
                    />
                  </div>
                  <div className="flex items-center gap-[10px ]">
                    <label className="mr-auto font-medium">ID:</label>
                    <input
                      type="text"
                      value={ndata?.id}
                      className="bg-[#dddce2] p-2 rounded-md"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-[10px]">
                    <label className="font-medium mr-auto">Age:</label>
                    <input
                      type="text"
                      value={ndata?.age}
                      className="bg-[#dddce2] p-2 rounded-md"
                    />
                  </div>
                  <div className="flex items-center gap-[10px]">
                    <label className="font-medium mr-auto">School:</label>
                    <input
                      type="text"
                      value={ndata?.course}
                      className="bg-[#dddce2] p-2 rounded-md"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-center gap-[10px]">
                    <label className="font-medium mr-auto">Sex:</label>
                    <input
                      type="text"
                      value={ndata?.sex}
                      className="bg-[#dddce2] p-2 rounded-md"
                    />
                  </div>
                  <div className="flex items-center gap-[10px]">
                    <label className="font-medium mr-auto">
                      Residence Type:
                    </label>
                    <input
                      type="text"
                      value={ndata?.residenceType}
                      className="bg-[#dddce2] p-2 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>
            <hr className="border border-black my-2" />
            <div className="mt-4 gap-2 flex flex-col">
              <label className="font-medium">Diagnosis:</label>
              <textarea
                className="w-full h-[100px] p-4 rounded-md bg-[#dddce2]"
                placeholder="Enter diagnosis here..."
                onChange={(event: any) => setDiagnosis(event.target.value)}
              ></textarea>
            </div>
            <div className="mt-4 max-lg:overflow-scroll flex flex-col gap-2">
              <label className="font-medium">Medicine:</label>
              <table className="max-lg:max-w-[95svw]">
                <thead>
                  <tr>
                    <th className="whitespace-nowrap font-medium p-2 border">
                      S. No.
                    </th>
                    <th className="whitespace-nowrap font-medium p-2 border">
                      Medicine
                    </th>
                    <th className="whitespace-nowrap font-medium p-2 border">
                      Dosage (/day)
                    </th>
                    <th className="whitespace-nowrap font-medium p-2 border">
                      Duration (Days)
                    </th>
                    <th className="whitespace-nowrap font-medium p-2 border">
                      Suggestions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((_, index) => (
                    <tr key={index}>
                      <td className="text-center w-[5%] border p-2">
                        {index + 1}
                      </td>
                      <td className="w-[30%] border p-2">
                        <Select
                          onValueChange={(value) =>
                            handleMedicineSelect(index, value)
                          }
                        >
                          <SelectTrigger className="w-[100%]">
                            <SelectValue placeholder="Select Medicine">
                              {selectedMedicine[index] || "Select Medicine"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <div className="p-2">
                              <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search Medicine"
                                className="w-full p-2 border rounded-md"
                                onChange={(e) => setSearchQuery(e.target.value)}
                              />
                            </div>
                            {stock
                              .filter((medicine) =>
                                medicine.medicineName
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase())
                              )
                              .map((medicine) => (
                                <SelectItem
                                  key={medicine.id}
                                  value={`${medicine.medicineName}:${medicine.id}`}
                                >
                                  {medicine.medicineName} (Quantity:{" "}
                                  {medicine.quantity})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="w-[20%] border p-2">
                        <table className="w-full">
                          <thead>
                            <tr>
                              <th className="border p-2 font-medium w-[33%]">
                                Morning
                              </th>
                              <th className="border p-2 font-medium w-[33%]">
                                Afternoon
                              </th>
                              <th className="border p-2 font-medium w-[33%]">
                                Evening
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border p-2">
                                <input
                                  type="number"
                                  min={0}
                                  className="rounded-md border p-2 bg-[#dddce2] dosage-morning w-full"
                                  placeholder="0"
                                />
                              </td>
                              <td className="border p-2">
                                <input
                                  type="number"
                                  min={0}
                                  className="rounded-md border p-2 bg-[#dddce2] dosage-afternoon w-full"
                                  placeholder="0"
                                />
                              </td>
                              <td className="border p-2">
                                <input
                                  type="number"
                                  min={0}
                                  className="rounded-md border p-2 bg-[#dddce2] dosage-evening w-full"
                                  placeholder="0"
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                      <td className="w-[10%] border p-2">
                        <input
                          type="number"
                          className="rounded-md border p-2 bg-[#dddce2] duration w-full"
                          placeholder="0"
                          min={1}
                        />
                      </td>
                      <td className="border p-2">
                        <textarea className="rounded-md border p-2 bg-[#dddce2] suggestion w-full" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex gap-4 justify-end mt-2 max-lg:gap-2 max-lg:justify-start">
                <Button
                  className="bg-gradient-to-r from-[#2061f5] to-[#13398f] w-20 whitespace-nowrap max-lg:py-1 max-lg:px-1"
                  onClick={addRow}
                >
                  Add
                </Button>
                <Button
                  className="bg-gradient-to-r from-[#2061f5] to-[#13398f] w-20 whitespace-nowrap max-lg:py-1 max-lg:px-1"
                  onClick={removeRow}
                >
                  Remove
                </Button>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <label className="font-medium">Recommendations:</label>
              <textarea
                className="w-full h-[100px] p-4 rounded-md bg-[#dddce2]"
                placeholder="Enter recommendations here..."
                onChange={(event: any) => setDietary(event.target.value)}
              ></textarea>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <label className="font-medium">Tests Needed:</label>
              <textarea
                className="w-full h-[100px] p-4 rounded-md bg-[#dddce2]"
                placeholder="Enter tests needed here..."
                onChange={(event: any) => setTests(event.target.value)}
              ></textarea>
            </div>
            <div className="flex flex-col items-end mt-10">
              <span>{ndata?.docName}</span>
              <span>({ndata?.designation})</span>
              <div className="font-bold">Doctor</div>
            </div>
          </div>
          <div className="flex min-w-[100%] max-lg:w-full">
            <Button
              type="button"
              className="px-4 py-5 text-white font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 w-[50%] rounded-none"
              onClick={handleRelease}
            >
              Release Patient
            </Button>
            <Button
              type="button"
              className="px-4 py-5 text-white font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 w-[50%] rounded-none"
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientDetails;
