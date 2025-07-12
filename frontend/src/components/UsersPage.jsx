import React from "react";
import { useQuery, gql, useMutation, useSubscription } from "@apollo/client";
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

const GAME_UPDATED_SUB = gql`
  subscription GameUpdated($gameId: ID!) {
    gameUpdated(gameId: $gameId) {
      id
      status
      playerX {
        id
      }
      playerO {
        id
      }
    }
  }
`;

const UsersPage = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(GET_USERS);
  const [createGame] = useMutation(CREATE_GAME_MUTATION);
  const currentUserId = localStorage.getItem("userId");
  const [createdGameId, setCreatedGameId] = React.useState(null);

  const [logoutMutation] = useMutation(LOGOUT_MUTATION, {
    variables: { id: currentUserId },
    onCompleted: () => {
      localStorage.removeItem("userId");
      localStorage.removeItem("token");
      navigate("/");
    },
  });

  const { data: subData } = useSubscription(GAME_UPDATED_SUB, {
    variables: { gameId: createdGameId },
    skip: !createdGameId,
  });

  React.useEffect(() => {
    if (subData && subData.gameUpdated) {
      const game = subData.gameUpdated;
      if (
        game.status === "IN_PROGRESS" &&
        (game.playerX.id === currentUserId || game.playerO.id === currentUserId)
      ) {
        navigate(`/game/${game.id}`);
      }
    }
  }, [subData, currentUserId, navigate]);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error: {error.message}</Typography>;

  const handleInvite = async (userId) => {
    try {
      const res = await createGame({
        variables: { playerX: currentUserId, playerO: userId },
      });
      const gameId = res.data.createGame.id;
      setCreatedGameId(gameId);
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

  return (
    <Container maxWidth="md">
      <Box display="flex" justifyContent="space-between" mt={4} mb={2}>
        <Typography variant="h4">Users List</Typography>
        <Button variant="contained" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      <Grid container spacing={3}>
        {data.users.map((user) => (
          <Grid item xs={12} sm={6} md={4} key={user.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{user.displayName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
                <Typography variant="body2">Score: {user.score}</Typography>
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
