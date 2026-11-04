package web.com.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.websockets.next.OpenConnections;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.util.HashMap;
import java.util.Map;

@ApplicationScoped
public class WebSocketBroadcaster {

    private static final Logger LOG = Logger.getLogger(WebSocketBroadcaster.class);

    @Inject
    OpenConnections openConnections;

    @Inject
    ObjectMapper objectMapper;

    public void broadcast(Long restaurantId, String eventType, Object payload) {
        if (restaurantId == null) return;
        String ridStr = restaurantId.toString();

        try {
            Map<String, Object> messageMap = new HashMap<>();
            messageMap.put("type", eventType);
            messageMap.put("restaurantId", restaurantId);
            messageMap.put("data", payload);
            messageMap.put("timestamp", System.currentTimeMillis());

            String jsonMessage = objectMapper.writeValueAsString(messageMap);

            openConnections.stream()
                .filter(conn -> ridStr.equals(conn.pathParam("restaurantId")))
                .forEach(conn -> conn.sendText(jsonMessage).subscribe().with(
                    v -> {},
                    err -> LOG.warnf("Failed to send WS message to %s: %s", conn.id(), err.getMessage())
                ));
        } catch (Exception e) {
            LOG.warnf("Failed to broadcast WS event %s: %s", eventType, e.getMessage());
        }
    }
}

