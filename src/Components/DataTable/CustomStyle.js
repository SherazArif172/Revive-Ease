const customStyles = {
  rows: {
    style: {
      minHeight: "50px",
      fontSize: "13px",
      paddingLeft: "",
      fontWeight: "600",
      "&:last-of-type": {
        borderBottomLeftRadius: "20px",
        borderBottomRightRadius: "20px",
      },
    },
  },
  headCells: {
    style: {
      color: "white",
      lineHeight: "21px",
      fontSize: "13px",
      fontWeight: "600",
      paddingLeft: "18px",
      paddingRight: "18px",
      borderRight: "1px solid white",
    },
  },
  cells: {
    style: {
      paddingLeft: "20px",
      paddingRight: "8px",
    },
  },
};


export default customStyles;

export const customStylesProvider = {
  rows: {
    style: {
      minHeight: "50px",
      fontSize: "13px",
      paddingLeft: "18px",
      fontWeight: "600",
      "&:last-of-type": {
        borderBottomLeftRadius: "20px",
        borderBottomRightRadius: "20px",
      },
    },
  },
  headCells: {
    style: {
      color: "white",
      lineHeight: "21px",
      fontSize: "13px",
      fontWeight: "600",
      paddingLeft: "18px",
      paddingRight: "18px",
      borderRight: "1px solid white",
    },
  },
  cells: {
    style: {
      paddingLeft: "20px",
      paddingRight: "8px",
    },
  },
};

export const customStylesChill = 
{
  rows: {
    style: {
      minHeight: "50px",
      fontSize: "13px",
      paddingLeft: "",
      fontWeight: "600",
      "&:last-of-type": {
        borderBottomLeftRadius: "20px",
        borderBottomRightRadius: "20px",
      },
    },
  },
  headCells: {
    style: {
      color: "white",
      lineHeight: "21px",
      fontSize: "13px",
      fontWeight: "600",
      paddingLeft: "18px",
      paddingRight: "18px",
      borderRight: "1px solid white",
    },
  },
  cells: {
    style: {
      paddingLeft: "20px",
      paddingRight: "8px",
    },
  },
};

export const customStylesBilling = {
  rows: {
    style: {
      minHeight: "50px", // override the row height
      fontSize: "13px",
      paddingLeft: "18px",
      fontWeight: "600",
      "&:last-of-type": {
        borderBottomLeftRadius: "20px",
        borderBottomRightRadius: "20px",
      },
    },
  },
  headCells: {
    style: {
      color: "white",
      lineHeight: "21px",
      fontSize: "13px",
      fontWeight: "600",
      paddingLeft: "18px", // override the cell padding for head cells
      paddingRight: "18px",
      borderRight: "1px solid white",
    },
  },
  cells: {
    style: {
      paddingLeft: "20px", // override the cell padding for data cells
      paddingRight: "8px",
    },
  },
};

export const customStylesPatient = {
  rows: {
    style: {
    
      minHeight: "50px",
      fontSize: "14px",
     
      fontWeight: "600",
      "&:last-of-type": {
        borderBottomLeftRadius: "20px",
        borderBottomRightRadius: "20px",
      },
    },
  },
  headCells: {
    style: {
      color: "white",
      fontSize: "14px",
      fontWeight: "600",
      paddingLeft: '8px',
      paddingRight: '5px',
      borderRight: "1px solid white",
    },
  },
  
  cells: {
    style: {
      paddingLeft: "10px",
    },
  },
  header : {
    marginRight : "10px",
  }
};

export const customStylesUser = {
  rows: {
    style: {
      minHeight: "50px", // override the row height
      fontSize: "13px",
      paddingLeft: "5px",
      fontWeight: "600",
      "&:last-of-type": {
        borderBottomLeftRadius: "20px",
        borderBottomRightRadius: "20px",
      },
    },
  },
  headCells: {
    style: {
      color: "white",
      lineHeight: "21px",
      fontSize: "13px",
      fontWeight: "600",
      paddingLeft: "28px",
      borderRight: "1px solid white",
    },
  },
  cells: {
    style: {
      paddingLeft: "20px", // override the cell padding for data cells
      paddingRight: "8px",
    },
  },
};

export const customStylesCoachPatients = {
  rows: {
    style: {
      minHeight: "50px", // override the row height
      fontSize: "13px",
      paddingLeft: "18px",
      fontWeight: "600",
      "&:last-of-type": {
        borderBottomLeftRadius: "20px",
        borderBottomRightRadius: "20px",
      },
      "&.rdt-selected": {
        backgroundColor: "red",
        paddingRight: "48px",
      },
    },
  },
  headCells: {
    style: {
      color: "white",
      lineHeight: "21px",
      fontSize: "13px",
      fontWeight: "600",
      paddingLeft: "18px",
      paddingRight: "18px",
      borderRight: "1px solid white",
    },
  },
  cells: {
    style: {
      paddingLeft: "8px", // override the cell padding for data cells
      paddingRight: "8px",
    },
  },
};

export const customStylesMdNotes = {
  rows: {
    style: {
      minHeight: "50px", // override the row height
      fontSize: "13px",
      paddingLeft: "18px",
      fontWeight: "600",
      "&:last-of-type": {
        borderBottomLeftRadius: "20px",
        borderBottomRightRadius: "20px",
      },
    },
  },
      headCells: {
      style: {
          color: "white",
          lineHeight: "21px",
          fontSize: "13px",
          fontWeight: "600",
          paddingLeft: "18px", // override the cell padding for head cells
          paddingRight: "18px",
          borderRight: "1px solid white",
       
      },
      },
  cells: {
    style: {
      paddingLeft: "20px", // override the cell padding for data cells
      paddingRight: "8px",
    },
  },
};

export const customStylesMonitoringHistory = {
  rows: {
    style: {
      minHeight: "50px", // override the row height
      fontSize: "13px",
      paddingLeft: "18px",
      fontWeight: "600",
      "&:last-of-type": {
        borderBottomLeftRadius: "20px",
        borderBottomRightRadius: "20px",
      },
    },
  },
  headCells: {
    style: {
      color: "white",
      lineHeight: "21px",
      fontSize: "13px",
      fontWeight: "600",
      paddingLeft: "18px", // override the cell padding for head cells
      paddingRight: "18px",
      borderRight: "1px solid white",

    },
  },
  cells: {
    style: {
      paddingLeft: "20px", // override the cell padding for data cells
      paddingRight: "8px",
    },
  },
};

export const customStylesClinic = 
{
  rows: {
    style: {
      minHeight: "50px", // override the row height
      fontSize: "13px",
      paddingLeft: "5px",
      fontWeight: "600",
      "&:last-of-type": {
        borderBottomLeftRadius: "20px",
        borderBottomRightRadius: "20px",
      },
    },
  },
  headCells: {
    style: {
      color: "white",
      lineHeight: "21px",
      fontSize: "13px",
      fontWeight: "600",
      paddingLeft: "28px",

      borderRight: "1px solid white",
    },
  },
  cells: {
    style: {
      paddingLeft: "20px", // override the cell padding for data cells
      paddingRight: "8px",
    },
  },
};

export const customStylesCoachReport = {
  rows: {
    style: {
      minHeight: "50px", // override the row height
      fontSize: "13px",
      paddingLeft: "18px",
      fontWeight: "600",
      "&:last-of-type": {
        borderBottomLeftRadius: "20px",
        borderBottomRightRadius: "20px",
      },
    },
  },
  headCells: {
    style: {
      color: "white",
      lineHeight: "21px",
      fontSize: "13px",
      fontWeight: "600",
      paddingLeft: "18px", // override the cell padding for head cells
      paddingRight: "18px",
      borderRight: "1px solid white",
    },
  },
  cells: {
    style: {
      paddingLeft: "20px", // override the cell padding for data cells
      paddingRight: "8px",
    },
  },
};

export const customStylesJourney = {
  rows: {
    style: {
      minHeight: "50px", // override the row height
      fontSize: "13px",
      paddingLeft: "8px",
      fontWeight: "600",
      "&:last-of-type": {
        borderBottomLeftRadius: "20px",
        borderBottomRightRadius: "20px",
      },
    },
  },
  headCells: {
    style: {
      color: "white",
      lineHeight: "21px",
      fontSize: "13px",
      fontWeight: "600",
      paddingLeft: "18px", // override the cell padding for head cells
      paddingRight: "18px",
      borderRight: "1px solid white",
    },
  },
  cells: {
    style: {
      paddingLeft: "20px", // override the cell padding for data cells
      paddingRight: "8px",
    },
  },
};

export const customStylesTask = {
  rows: {
    style: {
      minHeight: "50px",
      fontSize: "13px",
      paddingLeft: "5px",
      fontWeight: "600",
      "&:last-of-type": {
        borderBottomLeftRadius: "20px",
        borderBottomRightRadius: "20px",
      },
    },
  },
  headCells: {
    style: {
      color: "white",
      lineHeight: "21px",
      fontSize: "13px",
      fontWeight: "600",
      paddingLeft: "28px",

      borderRight: "1px solid white",
    },
  },
  cells: {
    style: {
      paddingLeft: "20px",
      paddingRight: "8px",
    },
  },
};

export const customStylesAlert = {
  rows: {
    style: {
      minHeight: "50px",
      fontSize: "13px",
      paddingLeft: "18px",
      fontWeight: "600",
      "&:last-of-type": {
        borderBottomLeftRadius: "20px",
        borderBottomRightRadius: "20px",
      },
    },
  },
  headCells: {
    style: {
      color: "white",
      lineHeight: "21px",
      fontSize: "13px",
      fontWeight: "600",
      paddingLeft: "18px",
      paddingRight: "18px",
      borderRight: "1px solid white",
    },
  },
  cells: {
    style: {
      width: "6%",
      maxWidth: "auto",
      paddingLeft: "8px", // override the cell padding for data cells
      paddingRight: "8px",
    },
  },
};

export const customStylesClinicDetails = {
  rows: {
    style: {
      minHeight: "50px", // override the row height
      fontSize: "13px",
      paddingLeft: "5px",
      fontWeight: "600",
      "&:last-of-type": {
        borderBottomLeftRadius: "20px",
        borderBottomRightRadius: "20px",
      },
    },
  },
  headCells: {
    style: {
      color: "white",
      lineHeight: "21px",
      fontSize: "13px",
      fontWeight: "600",
      paddingLeft: "28px",
      borderRight: "1px solid white",
    },
  },
  cells: {
    style: {
      paddingLeft: "20px",
      paddingRight: "8px",
    },
  },
};

export const customStylesBilledStatus = {
  rows: {
    style: {
      minHeight: "50px", // override the row height
      fontSize: "13px",
      paddingLeft: "5px",
      fontWeight: "600",
      "&:last-of-type": {
        borderBottomLeftRadius: "20px",
        borderBottomRightRadius: "20px",
      },
    },
  },
  headCells: {
    style: {
      color: "white",
      lineHeight: "21px",
      fontSize: "13px",
      fontWeight: "600",
      paddingLeft: "28px",
      borderRight: "1px solid white",
    },
  },
  cells: {
    style: {
      paddingLeft: "20px",
      paddingRight: "8px",
    },
  },
};

export const customStylesMyNotes = {
  rows: {
    style: {
      minHeight: "50px", // override the row height
      fontSize: "13px",
      paddingLeft: "5px",
      fontWeight: "600",
      "&:last-of-type": {
        borderBottomLeftRadius: "20px",
        borderBottomRightRadius: "20px",
      },
    },
  },
  headCells: {
    style: {
      color: "white",
      lineHeight: "21px",
      fontSize: "13px",
      fontWeight: "600",
      paddingLeft: "28px",
      borderRight: "1px solid white",
    },
  },
  cells: {
    style: {
      paddingLeft: "20px",
      paddingRight: "8px",
    },
  },
};

export const customStylesCreateBilling = {
  rows: {
    style: {
      minHeight: "50px", // override the row height
      fontSize: "13px",
      paddingLeft: "5px",
      fontWeight: "600",
      "&:last-of-type": {
        borderBottomLeftRadius: "20px",
        borderBottomRightRadius: "20px",
      },
    },
  },
  headCells: {
    style: {
      color: "white",
      lineHeight: "21px",
      fontSize: "13px",
      fontWeight: "600",
      paddingLeft: "28px",
      borderRight: "1px solid white",
    },
  },
  cells: {
    style: {
      paddingLeft: "20px",
      paddingRight: "8px",
    },
  },
};

export const customStylesBillingWithCpt = {
  rows: {
    style: {
      minHeight: "50px",
      fontSize: "13px",
      paddingLeft: "8px",
      fontWeight: "600",
      "&:last-of-type": {
        borderBottomLeftRadius: "20px",
        borderBottomRightRadius: "20px",
      },
      "&:first-of-type": {
        minWidth: "10px"
      }
    },
  },
  headCells: {
    style: {
      "&:first-of-type": {
        minWidth: "10px"
      },
      color: "white",
      fontSize: "13px",
      fontWeight: "600",
      paddingLeft: "8px",
      paddingRight: "8px",
      borderRight: "1px solid white",
    },
  },
  cells: {
    style: {
      paddingLeft: "8px",
      paddingRight: "8px",
      "&:first-of-type": {
        minWidth: "10px"
      }
    },
  },
};