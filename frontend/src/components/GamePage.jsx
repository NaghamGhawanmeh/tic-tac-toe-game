import React from "react";
import { useQuery, useMutation, useSubscription, gql } from "@apollo/client";
import { useParams } from "react-router-dom";
import { Container, Typography, Grid, Button } from "@mui/material";

const GET_GAME = gql`
  query GetGame($id: ID!) {
    game(id: $id) {
      id
      board
      currentTurn
      status
      winner
    }
  }
`;

const MAKE_MOVE = gql`
  mutation MakeMove($gameId: ID!, $index: Int!) {
    makeMove(gameId: $gameId, index: $index) {
      id
      board
      currentTurn
      status
      winner
    }
  }
`;

const GAME_UPDATED_SUB = gql`
  subscription GameUpdated($gameId: ID!) {
    gameUpdated(gameId: $gameId) {
      id
      board
      currentTurn
      status
      winner
    }
  }
`;

const GamePage = () => {
  const { id } = useParams();
  const { data, loading, error } = useQuery(GET_GAME, { variables: { id } });
  const { data: subData } = useSubscription(GAME_UPDATED_SUB, {
    variables: { gameId: id },
  });
  const [makeMove] = useMutation(MAKE_MOVE);

  const game = subData?.gameUpdated || data?.game;

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error: {error.message}</Typography>;
  if (!game) return <Typography>Game not found</Typography>;

  const handleCellClick = async (index) => {
    try {
      await makeMove({ variables: { gameId: id, index } });
    } catch (err) {
      console.error(err);
      alert("Invalid move!");
    }
  };

  return (
    <Container maxWidth="xs" sx={{ textAlign: "center", mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Tic Tac Toe
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Status: {game.status} | Turn: {game.currentTurn}
      </Typography>
      {game.winner && (
        <Typography variant="h5" color="success.main" gutterBottom>
          Winner: {game.winner}
        </Typography>
      )}
      <Grid container spacing={1}>
        {game.board.map((cell, index) => (
          <Grid item xs={4} key={index}>
            <Button
              variant="outlined"
              fullWidth
              sx={{ height: 80, fontSize: 24 }}
              onClick={() => handleCellClick(index)}
              disabled={cell !== "" || game.status !== "IN_PROGRESS"}
            >
              {cell}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default GamePage;
