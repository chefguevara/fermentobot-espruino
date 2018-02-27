import React, { Component } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import styled from 'styled-components';

const DataTable = (fermenters) => {
  const columns = [{
    Header: 'Cliente',
    accessor: 'customId' // String-based value accessors!
  }, {
    Header: 'temperatura',
    accessor: 'temp',
    Cell: props => <span className="number">{props.value}</span> // Custom cell components!
  }, {
    Header: 'valvula',
    accessor: 'valve',
    Cell: props => <span className="number">{props.value}</span> // Custom cell components!
  }];

  return (
    <ReactTable
      data={fermenters}
      columns={columns}
    />
  );
};

export default DataTable;
