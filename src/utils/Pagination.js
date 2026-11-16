import TablePagination from '@mui/material/TablePagination';

const PaginationComponent = ({
  totalRecords,
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
}) => {
  if (!totalRecords || totalRecords <= 0) return null;

  return (
    <div className="my-3 flex justify-end">
      <TablePagination
        component="div"
        count={totalRecords}
        page={page - 1}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 15, 20 , 50]}
      />
    </div>
  );
};

export default PaginationComponent;
