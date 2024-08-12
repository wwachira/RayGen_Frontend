
import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button,  InputAdornment
} from '@mui/material';
import { Edit, Delete ,Search} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom'; // To handle navigation
import './customers.css';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone_number: '',
    location: '',
    orders: '',
    total_expenditure: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate(); // Use navigate to redirect user

  const fetchData = async (url, options = {}) => {
    try {
      const response = await fetch(url, options);
      if (response.status === 401) {
        // Handle 401 Unauthorized
        setError('Session expired. Please log in again.');
        navigate('/login'); // Redirect to login page
        return;
      }
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || 'Something went wrong');
      }
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError('Session expired. Please log in again.');
        navigate('/login'); // Redirect to login page
        return;
      }

      try {
        const data = await fetchData('http://127.0.0.1:5000/users', {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        setCustomers(data || []);  // Ensure data is an array
      } catch (err) {
        setError('Error fetching customers.');
      }
    };

    fetchCustomers();
  }, [navigate]);

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setCustomerForm({
      name: customer.name,
      email: customer.email,
      phone_number: customer.phone_number,
      location: customer.location || '',
      orders: customer.orders || '',
      total_expenditure: customer.total_expenditure || ''
    });
    setEditDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setSelectedCustomer(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerForm({
      ...customerForm,
      [name]: value
    });
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("access_token");
    try {
      await fetchData(`http://127.0.0.1:5000/users/${selectedCustomer.user_id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(customerForm)
      });

      setCustomers(customers.map(customer =>
        customer.user_id === selectedCustomer.user_id ? { ...customer, ...customerForm } : customer
      ));
      handleCloseDialog();
    } catch (error) {
      console.error("Error updating customer:", error);
    }
  };

  const handleDelete = async (customerId) => {
    const token = localStorage.getItem("access_token");
    try {
      console.log(`Attempting to delete customer with ID: ${customerId}`);
      const response = await fetch(`http://127.0.0.1:5000/users/${customerId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
  
      const responseBody = await response.text();
      console.log("Response body:", responseBody);
  
      if (response.ok) {
        console.log("Customer deleted successfully");
        setCustomers(customers.filter(customer => customer.user_id !== customerId));
      } else {
        throw new Error(responseBody || 'Failed to delete customer');
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      setError("Failed to delete customer: " + error.message);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (customers.length === 0 && !error) {
    return <Typography>Loading customers...</Typography>;
  }

  return (
    <div className="customers-page">
       <div className="header">
        <Typography variant="h4" sx={{ color: 'navy' }} gutterBottom>
          Customers
        </Typography>
        <TextField
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-bar"
          placeholder="Search by Orders ...."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{
            borderRadius: '70px',
            '& fieldset': {
              borderRadius: '70px',
              borderColor: 'navy', // Navy border color
            },
            '& input': {
              color: 'navy', // Placeholder text color
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'navy', // Border color of the text field
              },
              '&:hover fieldset': {
                borderColor: 'navy', // Border color on hover
              },
              '&.Mui-focused fieldset': {
                borderColor: 'navy', // Border color when focused
              },
            },
          }}
        />
        
      </div>
      {error && <Typography color="error">{error}</Typography>}
      <TableContainer component={Paper} className="customer-container">
        <Table>
          <TableHead>
            <TableRow className="sticky-header">
              <TableCell className="table-cell">Name</TableCell>
              <TableCell className="table-cell">Email</TableCell>
              <TableCell className="table-cell">Phone number</TableCell>
              <TableCell className="table-cell">Location</TableCell>
              <TableCell className="table-cell">Orders</TableCell>
              <TableCell className="table-cell">Total Expenditure</TableCell>
              <TableCell className="table-cell">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.length > 0 ? (
              customers.map((customer) => (
                <TableRow key={customer.user_id} className='customer-row'>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone_number}</TableCell>
                  <TableCell>{customer.location || "N/A"}</TableCell>
                  <TableCell>{customer.orders || "N/A"}</TableCell>
                  <TableCell>{customer.total_expenditure || "N/A"}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleEdit(customer)}
                      sx={{ color: 'blue' }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(customer.user_id)}
                      sx={{ color: 'red' }}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7}>No customers found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={editDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Edit Customer</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            name="name"
            value={customerForm.name}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Email"
            name="email"
            value={customerForm.email}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Phone number"
            name="phone_number"
            value={customerForm.phone_number}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Location"
            name="location"
            value={customerForm.location}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Orders"
            name="orders"
            value={customerForm.orders}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Total Expenditure"
            name="total_expenditure"
            value={customerForm.total_expenditure}
            onChange={handleInputChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleUpdate}>Update</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Customers;