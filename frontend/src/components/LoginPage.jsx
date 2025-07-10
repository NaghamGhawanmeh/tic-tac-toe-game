import React, { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  CardContent,
} from "@mui/material";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

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

const SIGNUP_MUTATION = gql`
  mutation Signup($displayName: String!, $email: String!, $password: String!) {
    signup(displayName: $displayName, email: $email, password: $password) {
      id
      displayName
      email
      status
      score
    }
  }
`;

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const RegisterSchema = Yup.object().shape({
  displayName: Yup.string().required("Display name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const AuthPage = () => {
  const [mode, setMode] = useState("login");
  const [login] = useMutation(LOGIN_MUTATION);
  const [signup] = useMutation(SIGNUP_MUTATION);

  const handleModeChange = (_, newMode) => {
    if (newMode) setMode(newMode);
  };

  return (
    <Box sx={{ backgroundColor: "#f4f6f8", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={handleModeChange}
              fullWidth
              sx={{ mb: 3 }}
            >
              <ToggleButton value="login">Login</ToggleButton>
              <ToggleButton value="register">Register</ToggleButton>
            </ToggleButtonGroup>

            <Typography variant="h5" align="center" gutterBottom>
              {mode === "login"
                ? "Login to Your Account"
                : "Create a New Account"}
            </Typography>

            <Formik
              initialValues={{ displayName: "", email: "", password: "" }}
              validationSchema={mode === "login" ? LoginSchema : RegisterSchema}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  if (mode === "login") {
                    const res = await login({
                      variables: {
                        email: values.email,
                        password: values.password,
                      },
                    });
                    console.log("Login data:", res.data);
                    alert("Logged in successfully!");
                  } else {
                    const res = await signup({ variables: values });
                    console.log("Signup data:", res.data);
                    alert("Registered successfully!");
                  }
                } catch (err) {
                  console.error(err);
                  alert(`${mode === "login" ? "Login" : "Register"} failed!`);
                }
                setSubmitting(false);
              }}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form>
                  {mode === "register" && (
                    <Field
                      as={TextField}
                      label="Display Name"
                      name="displayName"
                      fullWidth
                      margin="normal"
                      error={touched.displayName && Boolean(errors.displayName)}
                      helperText={touched.displayName && errors.displayName}
                    />
                  )}
                  <Field
                    as={TextField}
                    label="Email"
                    name="email"
                    fullWidth
                    margin="normal"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                  <Field
                    as={TextField}
                    label="Password"
                    name="password"
                    type="password"
                    fullWidth
                    margin="normal"
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{
                      mt: 2,
                      backgroundColor: "#1976d2",
                      ":hover": { backgroundColor: "#1565c0" },
                    }}
                    disabled={isSubmitting}
                  >
                    {mode === "login" ? "Login" : "Register"}
                  </Button>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default AuthPage;
