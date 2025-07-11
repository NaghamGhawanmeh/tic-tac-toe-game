import React from "react";
import { useQuery, gql, useMutation } from "@apollo/client";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Box,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      displayName
      email
      score
      status
    }
  }
`;

// Mutation لتغيير حالة المستخدم إلى OFFLINE عند تسجيل الخروج
const LOGOUT_MUTATION = gql`
  mutation Logout($id: ID!) {
    updateUserStatus(id: $id, status: OFFLINE) {
      id
      status
    }
  }
`;
const CREATE_GAME_MUTATION = gql`
  mutation CreateGame($playerX: ID!, $playerO: ID!) {
    createGame(playerX: $playerX, playerO: $playerO) {
      id
      status
      currentTurn
    }
  }
`;

const UsersPage = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(GET_USERS);
  const [createGame] = useMutation(CREATE_GAME_MUTATION);

  // انت بتختاري ID المستخدم الحالي من التوكن أو من localStorage
  const currentUserId = localStorage.getItem("userId");

  const [logoutMutation] = useMutation(LOGOUT_MUTATION, {
    variables: { id: currentUserId },
    onCompleted: () => {
      // امسح بيانات المستخدم من التخزين
      localStorage.removeItem("userId");
      localStorage.removeItem("token");
      navigate("/");
    },
  });

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error: {error.message}</Typography>;

  const handleInvite = async (userId) => {
    try {
      const res = await createGame({
        variables: {
          playerX: currentUserId,
          playerO: userId,
        },
      });
      console.log("Game created:", res.data.createGame);
      alert(`Invitation sent to user with ID: ${userId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to send game request!");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation();
      alert("Logged out successfully!");
    } catch (err) {
      console.error(err);
      alert("Logout failed!");
    }
  };
  console.log(data);

  return (
    <Container maxWidth="md">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={4}
        mb={2}
      >
        <Typography variant="h4">Users List</Typography>
        <Button variant="contained" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      <Grid container spacing={3}>
        {data.users.map((user) => (
          <Grid item xs={12} sm={6} md={4} key={user.id}>
            <Card sx={{ minHeight: 200 }}>
              <CardContent>
                <Typography variant="h6">{user.displayName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
                <Typography variant="body2" mt={1}>
                  Score: {user.score}
                </Typography>
                <Chip
                  label={user.status}
                  color={
                    user.status === "ONLINE"
                      ? "success"
                      : user.status === "PLAYING"
                      ? "warning"
                      : "default"
                  }
                  sx={{ mt: 1 }}
                />

                {user.status === "ONLINE" && user.id !== currentUserId && (
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    sx={{ mt: 1 }}
                    onClick={() => handleInvite(user.id)}
                  >
                    Invite to Play
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default UsersPage;
