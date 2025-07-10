import React, { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { Container, TextField, Button, Typography, Box } from "@mui/material";

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        displayName
        email
        status
        score
      }
    }
  }
`;

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [login, { data, error }] = useMutation(LOGIN_MUTATION);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ variables: { ...formData } });
      alert("Logged in successfully!");
    } catch (err) {
      console.error(err);
      alert("Login failed!");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={5}>
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Login
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default LoginPage;
