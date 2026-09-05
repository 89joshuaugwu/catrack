import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { csvText } from "./csv";
export function reportCSV(filename:string,head:string[],rows:unknown[][]) {
  const url=URL.createObjectURL(new Blob([csvText([head,...rows])],{type:"text/csv;charset=utf-8;"}));
  const a=document.createElement("a");a.href=url;a.download=filename+".csv";a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function reportPDF(filename:string,head:string[],rows:(string|number)[][]) {
  const doc=new jsPDF({orientation:head.length>5?"landscape":"portrait"});
  doc.setFontSize(15);doc.text("CATrack assessment report",14,18);
  doc.setFontSize(10);doc.text(doc.splitTextToSize(filename,doc.internal.pageSize.getWidth()-28),14,26);
  autoTable(doc,{startY:38,head:[head],body:rows,styles:{fontSize:8},horizontalPageBreak:true});
  doc.save(filename+".pdf");
}
