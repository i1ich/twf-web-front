import React from "react";
import { Route, Switch } from "react-router-dom";
// pages
import HomePage from "./pages/home-page/home-page";
import GamesPage from "./pages/games-page/games-page";
import GameInfoPage from "./pages/game-info-page/game-info-page";
import PlayerInfoPage from "./pages/player-info-page/player-info-page";
import UsersPage from "./pages/users-page/users-page";
import LevelInfoPage from "./pages/level-info-page/level-info-page";
import CreateGamePage from "./pages/create-game-page/create-game-page";
import ConstructorMenuPage from "./pages/constructor-menu-page/constructor-menu-page";
import SolveMathPage from "./pages/solve-math-page/solve-math-page";

const Routes: React.FC = () => {
  return (
    <Switch>
      <Route exact path={"/"} component={HomePage} />
      <Route exact path={"/matify-games"} component={GamesPage} />
      <Route exact path={"/matify-games/:gameCode"} component={GameInfoPage} />
      <Route
        exact
        path={"/matify-players/:playerCode"}
        component={PlayerInfoPage}
      />
      <Route exact path={"/matify-players"} component={UsersPage} />
      <Route
        exact
        path={"/matify-levels/:levelCode"}
        component={LevelInfoPage}
      />
      <Route exact path={"/json-editor"} component={CreateGamePage} />
      <Route exact path={"/constructor-menu"} component={ConstructorMenuPage} />
      <Route exact path={"/solve-math"} component={SolveMathPage} />
    </Switch>
  );
};

export default Routes;
