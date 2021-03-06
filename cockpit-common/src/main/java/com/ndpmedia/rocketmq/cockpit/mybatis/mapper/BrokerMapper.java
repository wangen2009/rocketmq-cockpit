package com.ndpmedia.rocketmq.cockpit.mybatis.mapper;

import com.ndpmedia.rocketmq.cockpit.model.Broker;
import com.ndpmedia.rocketmq.cockpit.model.BrokerLoad;
import org.apache.ibatis.annotations.Param;

import java.util.Date;
import java.util.List;

public interface BrokerMapper {

    boolean exists(Broker broker);

    void insert(Broker broker);

    void refresh(@Param("id") long id,
                 @Param("brokerAddress") String brokerAddress);

    Broker get(@Param("id") long id);

    Broker getBrokerByAddress(@Param("address") String address);

    List<Broker> list(@Param("clusterName") String clusterName,
                      @Param("brokerName") String brokerName,
                      @Param("brokerId") int brokerId,
                      @Param("dc") int dc,
                      @Param("syncTimeDeadline") Date syncTimeDeadline);

    List<Broker> queryDeprecatedBrokers(@Param("clusterName") String clusterName,
                                        @Param("dc") int dc);

    List<BrokerLoad> queryBrokerLoad(@Param("dcId") int dcId,
                                     @Param("brokerId") Integer brokerId);


    boolean hasConsumerGroup(@Param("brokerId") long brokerId,
                             @Param("consumerGroupId")long consumerGroupId);

    void createConsumerGroup(@Param("brokerId") long brokerId,
                             @Param("consumerGroupId") long consumerGroupId);

    boolean hasTopic(@Param("brokerId")long brokerId,
                     @Param("topicId")long topicId);
}
