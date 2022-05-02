import { useForm } from "react-hook-form";
import Axios from "axios";
import logo from "./logo.svg";
import "./App.css";
import React, { useEffect, useState } from "react";

function App() {
  const [session, setSession] = useState("logout");
  const [servers, setServers] = useState([]);
  const [error, setError] = useState("");
  const { handleSubmit, register } = useForm({ mode: "onSubmit" });
  const reloadServers = async (data) => {
    try {
      const servers = await Axios.get("http://localhost:8000/servers");

      setServers(servers.data.result);
    } catch (error) {
      if (Axios.isAxiosError(error)) setError(error.response?.data.message);
    }
  };
  const handleForm = async (data) => {
    try {
      const user = await Axios.post("http://localhost:8000/auth/login", data);

      setSession(user.data.result.role);
      await reloadServers();
    } catch (error) {
      if (Axios.isAxiosError(error)) setError(error.response?.data.message);
    }
  };
  const addFiles = async (servName) => {
    try {
      let size = prompt("Tamaño del archivo");
      const user = await Axios.patch("http://localhost:8000/server", {
        servName,
        size,
      });
      console.log(user);
      await reloadServers();
      if (user.data.result.alerta) {
        alert("Espacio de memoria casi lleno, favor solicitar depuración");
      }
    } catch (error) {
      if (Axios.isAxiosError(error)) alert(error.response?.data.message);
    }
  };
  const createServer = async () => {
    try {
      let servName = prompt("Nombre Servidor");
      let ip = prompt("Dirección IP");
      const user = await Axios.post("http://localhost:8000/server", {
        ip,
        servName,
      });
      console.log(user);
      await reloadServers();
    } catch (error) {
      if (Axios.isAxiosError(error)) alert(error.response?.data.message);
    }
  };
  const purgeServer = async (servName) => {
    try {
      let elim = prompt("Memoria a Borrar");
      const user = await Axios.put("http://localhost:8000/server", {
        servName,
        elim,
      });
      console.log(user);
      await reloadServers();
      if (user.data.result.alerta) {
        alert("No se ha depurado el tamaño suficiente, depurar de nuevo");
      }
    } catch (error) {
      if (Axios.isAxiosError(error)) alert(error.response?.data.message);
    }
  };
  return (
    <>
      {session === "logout" ? (
        <form onSubmit={handleSubmit(handleForm)}>
          <h4>Username</h4>
          <input {...register("username")} />
          <h4>Password</h4> <input {...register("password")} type="password" />{" "}
          <div>
            <button type="submit"> Login </button>{" "}
          </div>
          <div> {error} </div>{" "}
        </form>
      ) : (
        <div>
          {servers.map((server) => (
            <div key={server.servName}>
              <h2>Nombre:{server.servName}</h2>
              <h4>IP:{server.ip}</h4>
              <h4>Capacidad:{server.capacity}</h4>
              <h4>Porcentaje Ocupado:{server.capUse}</h4>
              <div
                style={{
                  display: "flex",
                  padding: "8px",
                  alignItems: "center",
                  boxSizing: "border-box",
                  justifyContent: "start",
                }}
              >
                {session === "admin" ? (
                  <>
                    <button
                      onClick={() => {
                        addFiles(server.servName);
                      }}
                    >
                      Add File
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        purgeServer(server.servName);
                      }}
                    >
                      Depurar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {session === "admin" &&
          <button
            onClick={() => {
              createServer();
            }}
          >
            Crear Servidor
          </button>}
        </div>
      )}
    </>
  );
}

export default App;
