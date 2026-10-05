package com.finwise.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class RabbitMqConfig {

    public static final String TOPIC_EXCHANGE = "finwise.events";
    public static final String DEAD_LETTER_EXCHANGE = "finwise.dlx";

    public static final String EMAIL_QUEUE = "notification.email.queue";
    public static final String INAPP_QUEUE = "notification.inapp.queue";
    public static final String DEAD_LETTER_QUEUE = "notification.dlq";

    public static final String EMAIL_ROUTING_KEY = "notification.email.#";
    public static final String INAPP_ROUTING_KEY = "notification.inapp.#";
    public static final String ALL_NOTIFICATION_KEY = "notification.#";

    @Bean
    public TopicExchange eventsExchange() {
        return new TopicExchange(TOPIC_EXCHANGE, true, false);
    }

    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange(DEAD_LETTER_EXCHANGE, true, false);
    }

    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(DEAD_LETTER_QUEUE).build();
    }

    @Bean
    public Binding deadLetterBinding() {
        return BindingBuilder.bind(deadLetterQueue()).to(deadLetterExchange()).with(DEAD_LETTER_QUEUE);
    }

    @Bean
    public Queue emailQueue() {
        Map<String, Object> args = new HashMap<>();
        args.put("x-dead-letter-exchange", DEAD_LETTER_EXCHANGE);
        args.put("x-dead-letter-routing-key", DEAD_LETTER_QUEUE);
        args.put("x-message-ttl", 86400000); // 24 hours
        return QueueBuilder.durable(EMAIL_QUEUE).withArguments(args).build();
    }

    @Bean
    public Queue inAppQueue() {
        return QueueBuilder.durable(INAPP_QUEUE).build();
    }

    @Bean
    public Binding emailBinding() {
        return BindingBuilder.bind(emailQueue()).to(eventsExchange()).with(EMAIL_ROUTING_KEY);
    }

    @Bean
    public Binding inAppBinding() {
        return BindingBuilder.bind(inAppQueue()).to(eventsExchange()).with(INAPP_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
