import PdfMake from "views/PdfMake";
import Notes from "Notes/Notes";

const dashboardRoutes = [
  {
    path: "/pdfmaker",
    name: "Report Designer",
    icon: "nc-icon nc-paper-2",
    component: PdfMake,
    layout: "/admin",
  },
  {
    path: "/notes",
    name: "Notes Demo",
    icon: "nc-icon nc-notes",
    component: Notes,
    layout: "/admin",
  },
];

export default dashboardRoutes;

