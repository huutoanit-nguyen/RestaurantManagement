package web.com.websocket;

import io.quarkus.websockets.next.OnClose;
import io.quarkus.websockets.next.OnError;
import io.quarkus.websockets.next.OnOpen;
import io.quarkus.websockets.next.OnTextMessage;
import io.quarkus.websockets.next.PathParam;
import io.quarkus.websockets.next.WebSocket;
import io.quarkus.websockets.next.WebSocketConnection;
import org.jboss.logging.Logger;

@WebSocket(path = "/ws/restaurant/{restaurantId}")
public class RestaurantWebSocket {

    private static final Logger LOG = Logger.getLogger(RestaurantWebSocket.class);

    @OnOpen
    public void onOpen(WebSocketConnection connection, @PathParam("restaurantId") String restaurantId) {
        LOG.infof("Client connected to restaurant WS: %s (id: %s)", restaurantId, connection.id());
    }

    @OnClose
    public void onClose(WebSocketConnection connection, @PathParam("restaurantId") String restaurantId) {
        LOG.infof("Client disconnected from restaurant WS: %s (id: %s)", restaurantId, connection.id());
    }

    @OnError
    public void onError(WebSocketConnection connection, Throwable throwable, @PathParam("restaurantId") String restaurantId) {
        LOG.warnf("Error in restaurant WS %s: %s", restaurantId, throwable.getMessage());
    }

    @OnTextMessage
    public String onMessage(String message, WebSocketConnection connection) {
        return "{\"type\":\"PONG\"}";
    }
}

