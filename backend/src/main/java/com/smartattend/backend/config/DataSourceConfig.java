package com.smartattend.backend.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
@Profile("!test")
public class DataSourceConfig {

    @Value("${spring.datasource.url:}")
    private String springDatasourceUrl;

    @Value("${spring.datasource.username:postgres}")
    private String defaultUsername;

    @Value("${spring.datasource.password:postgres}")
    private String defaultPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        // Prioritize Render / cloud environment variable DATABASE_URL if provided
        String databaseUrl = System.getenv("DATABASE_URL");
        if (databaseUrl == null || databaseUrl.isBlank()) {
            databaseUrl = springDatasourceUrl;
        }

        HikariConfig config = new HikariConfig();

        if (databaseUrl != null && !databaseUrl.isBlank()) {
            // Handle URI format: postgres://user:pass@host:port/dbname or postgresql://...
            if (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://")) {
                try {
                    URI uri = new URI(databaseUrl);
                    String host = uri.getHost();
                    int port = uri.getPort() != -1 ? uri.getPort() : 5432;
                    String path = uri.getPath(); // e.g. /dbname
                    String query = uri.getQuery();

                    String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path;
                    if (query != null && !query.isBlank()) {
                        jdbcUrl += "?" + query;
                    } else {
                        jdbcUrl += "?sslmode=require";
                    }

                    config.setJdbcUrl(jdbcUrl);

                    if (uri.getUserInfo() != null) {
                        String[] userInfo = uri.getUserInfo().split(":", 2);
                        config.setUsername(userInfo[0]);
                        if (userInfo.length > 1) {
                            config.setPassword(userInfo[1]);
                        }
                    } else {
                        config.setUsername(defaultUsername);
                        config.setPassword(defaultPassword);
                    }
                } catch (Exception e) {
                    // Fallback to prepending jdbc: if parsing fails
                    if (!databaseUrl.startsWith("jdbc:")) {
                        databaseUrl = "jdbc:" + databaseUrl;
                    }
                    config.setJdbcUrl(databaseUrl);
                    config.setUsername(defaultUsername);
                    config.setPassword(defaultPassword);
                }
            } else {
                config.setJdbcUrl(databaseUrl);
                config.setUsername(defaultUsername);
                config.setPassword(defaultPassword);
            }
        } else {
            config.setJdbcUrl("jdbc:postgresql://localhost:5432/smart_attendance");
            config.setUsername(defaultUsername);
            config.setPassword(defaultPassword);
        }

        config.setDriverClassName("org.postgresql.Driver");
        config.setMaximumPoolSize(5); // Render free tier has strict connection limits
        config.setMinimumIdle(1);
        config.setIdleTimeout(30000);
        config.setConnectionTimeout(20000);

        return new HikariDataSource(config);
    }
}
