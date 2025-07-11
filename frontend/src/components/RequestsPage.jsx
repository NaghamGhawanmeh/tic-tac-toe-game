import React from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
} from "@mui/material";

const GET_GAMES = gql`
  query GetGames {
    games {
      id
      playerX {
        id
        displayName
      }
      playerO {
        id
        displayName
      }
      status
    }
  }
`;

const ACCEPT_GAME = gql`
  mutation AcceptGameRequest($gameId: ID!, $playerO: ID!) {
    acceptGameRequest(gameId: $gameId, playerO: $playerO) {
      id
      status
    }
  }
`;

const REJECT_GAME = gql`
  mutation RejectGameRequest($gameId: ID!) {
    rejectGameRequest(gameId: $gameId) {
      id
      status
    }
  }
`;

const RequestsPage = () => {
  const { data, loading, error, refetch } = useQuery(GET_GAMES);
  console.log("hhhhh:", data);

  const [acceptGame] = useMutation(ACCEPT_GAME);
  const [rejectGame] = useMutation(REJECT_GAME);

  const currentUserId = localStorage.getItem("userId");

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error: {error.message}</Typography>;

  const pendingGames = data.games.filter(
    (game) =>
      game.playerO?.id === currentUserId &&
      game.status === "WAITING_FOR_REQUEST"
  );

  const handleAccept = async (gameId) => {
    try {
      await acceptGame({ variables: { gameId, playerO: currentUserId } });
      alert("Request accepted!");
      refetch();
    } catch (err) {
      console.error(err);
      alert("Failed to accept the request");
    }
  };

  const handleReject = async (gameId) => {
    try {
      await rejectGame({ variables: { gameId } });
      alert("Request rejected!");
      refetch();
    } catch (err) {
      console.error(err);
      alert("Failed to reject the request");
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" mt={4} mb={2}>
        Incoming Requests
      </Typography>
      {pendingGames.length === 0 ? (
        <Typography>No requests at the moment.</Typography>
      ) : (
        pendingGames.map((game) => (
          <Card key={game.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">
                Request from: {game.playerX.displayName}
              </Typography>
              <Box display="flex" gap={2} mt={2}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleAccept(game.id)}
                >
                  Accept
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleReject(game.id)}
                >
                  Reject
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Container>
  );
};

export default RequestsPage;
