import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

interface NotificationAnalyticsDashboardProps {
  onBack: () => void;
}

export function NotificationAnalyticsDashboard({ onBack }: NotificationAnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("week");
  const [activeTab, setActiveTab] = useState<"overview" | "engagement" | "performance" | "health">("overview");

  const deliveryAnalytics = useQuery(api.notificationAnalytics.getDeliveryAnalytics, { timeRange });
  const funnelAnalytics = useQuery(api.notificationAnalytics.getFunnelAnalytics, { timeRange });
  const engagementDashboard = useQuery(api.notificationAnalytics.getUserEngagementDashboard, { timeRange });
  const systemHealth = useQuery(api.notificationAnalytics.getSystemHealthMetrics);
  const performanceMetrics = useQuery(api.notificationAnalytics.getPerformanceMonitoring, { timeRange });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatPercentage = (num: number) => `${num.toFixed(1)}%`;
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: 'fas fa-chart-line' },
    { id: 'engagement', name: 'Engagement', icon: 'fas fa-users' },
    { id: 'performance', name: 'Performance', icon: 'fas fa-tachometer-alt' },
    { id: 'health', name: 'System Health', icon: 'fas fa-heartbeat' }
  ];

  const timeRanges = [
    { id: 'day', name: 'Last 24h' },
    { id: 'week', name: 'Last 7 days' },
    { id: 'month', name: 'Last 30 days' }
  ];

  if (!deliveryAnalytics || !funnelAnalytics || !engagementDashboard) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mr-3"></div>
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <i className="fas fa-arrow-left text-gray-600"></i>
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Notification Analytics</h1>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex space-x-2">
          {timeRanges.map((range) => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id as any)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                timeRange === range.id
                  ? "bg-accent text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {range.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-white text-accent shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <i className={tab.icon}></i>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Notifications</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatNumber(deliveryAnalytics.totalNotifications)}
                  </p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-bell text-blue-600"></i>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Delivery Rate</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatPercentage(deliveryAnalytics.performanceMetrics.deliverySuccessRate)}
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-check text-green-600"></i>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Engagement Rate</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatPercentage(deliveryAnalytics.engagementMetrics.clickThroughRate)}
                  </p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-mouse-pointer text-purple-600"></i>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Delivery Time</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatDuration(deliveryAnalytics.performanceMetrics.averageDeliveryTime)}
                  </p>
                </div>
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-clock text-orange-600"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Funnel Chart */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Funnel</h3>
            <div className="space-y-4">
              {[
                { label: 'Created', value: funnelAnalytics.funnel.created, rate: 100 },
                { label: 'Delivered', value: funnelAnalytics.funnel.delivered, rate: funnelAnalytics.conversionRates.deliveryRate },
                { label: 'Viewed', value: funnelAnalytics.funnel.viewed, rate: funnelAnalytics.conversionRates.viewRate },
                { label: 'Clicked', value: funnelAnalytics.funnel.clicked, rate: funnelAnalytics.conversionRates.clickRate }
              ].map((step) => (
                <div key={step.label} className="flex items-center space-x-4">
                  <div className="w-20 text-sm text-gray-600">{step.label}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div
                      className="bg-accent h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${step.rate}%` }}
                    >
                      <span className="text-white text-xs font-medium">
                        {formatPercentage(step.rate)}
                      </span>
                    </div>
                  </div>
                  <div className="w-16 text-sm text-gray-900 text-right">
                    {formatNumber(step.value)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Channel Performance */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Channel Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(deliveryAnalytics.deliveryMetrics).map(([channel, metrics]) => (
                <div key={channel} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 capitalize">{channel.replace('_', '-')}</h4>
                    <i className={`fas ${
                      channel === 'in_app' ? 'fa-mobile-alt' :
                      channel === 'email' ? 'fa-envelope' :
                      channel === 'whatsapp' ? 'fa-whatsapp' :
                      'fa-sms'
                    } text-gray-600`}></i>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sent:</span>
                      <span className="font-medium">{formatNumber(metrics.sent)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivered:</span>
                      <span className="font-medium">{formatNumber(metrics.delivered)}</span>
                    </div>
                    {'viewed' in metrics && metrics.viewed !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Viewed:</span>
                        <span className="font-medium">{formatNumber(metrics.viewed)}</span>
                      </div>
                    )}
                    {'opened' in metrics && metrics.opened !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Opened:</span>
                        <span className="font-medium">{formatNumber(metrics.opened)}</span>
                      </div>
                    )}
                    {'failed' in metrics && metrics.failed !== undefined && metrics.failed > 0 && (
                      <div className="flex justify-between">
                        <span className="text-red-600">Failed:</span>
                        <span className="font-medium text-red-600">{formatNumber(metrics.failed)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Engagement Tab */}
      {activeTab === 'engagement' && (
        <div className="space-y-6">
          {/* Engagement Summary */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Engagement Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">
                  {formatNumber(engagementDashboard.summary.totalReceived)}
                </div>
                <div className="text-sm text-gray-600">Notifications Received</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">
                  {formatNumber(engagementDashboard.summary.totalViewed)}
                </div>
                <div className="text-sm text-gray-600">Notifications Viewed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">
                  {formatPercentage(engagementDashboard.summary.engagementRate)}
                </div>
                <div className="text-sm text-gray-600">Overall Engagement Rate</div>
              </div>
            </div>
          </div>

          {/* Category Engagement */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Engagement by Category</h3>
            <div className="space-y-3">
              {Object.entries(engagementDashboard.categoryEngagement).map(([category, data]: [string, any]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <i className={`fas ${
                        category === 'engagement' ? 'fa-heart' :
                        category === 'social' ? 'fa-users' :
                        category === 'content' ? 'fa-file-alt' :
                        'fa-cog'
                      } text-white text-sm`}></i>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 capitalize">{category}</div>
                      <div className="text-sm text-gray-600">
                        {data.received} received • {data.viewed} viewed • {data.clicked} clicked
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {formatPercentage(data.engagementRate)}
                    </div>
                    <div className="text-sm text-gray-600">engagement</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {engagementDashboard.recommendations.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-yellow-800 mb-2">Recommendations</h3>
              <ul className="space-y-1">
                {engagementDashboard.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-yellow-700 flex items-start space-x-2">
                    <i className="fas fa-lightbulb mt-0.5"></i>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && performanceMetrics && (
        <div className="space-y-6">
          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">
                  {formatNumber(performanceMetrics.throughput.notificationsPerHour)}
                </div>
                <div className="text-sm text-gray-600">Notifications/Hour</div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">
                  {formatDuration(performanceMetrics.latency.avgDeliveryLatencyMs)}
                </div>
                <div className="text-sm text-gray-600">Avg Delivery Time</div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">
                  {formatPercentage(performanceMetrics.reliability.successRate)}
                </div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
            <div className="flex items-center space-x-4">
              <div className={`w-3 h-3 rounded-full ${
                performanceMetrics.systemStatus.status === 'healthy' ? 'bg-green-500' :
                performanceMetrics.systemStatus.status === 'warning' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}></div>
              <span className="font-medium capitalize">{performanceMetrics.systemStatus.status}</span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-600">{performanceMetrics.systemStatus.uptime}% uptime</span>
            </div>
          </div>

          {/* Batching Efficiency */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Batching Efficiency</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">
                  {performanceMetrics.batchingEfficiency.totalBatches}
                </div>
                <div className="text-sm text-gray-600">Total Batches</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">
                  {performanceMetrics.batchingEfficiency.avgBatchSize.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Avg Batch Size</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">
                  {formatPercentage(performanceMetrics.batchingEfficiency.batchingRate)}
                </div>
                <div className="text-sm text-gray-600">Batching Rate</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Health Tab */}
      {activeTab === 'health' && systemHealth && (
        <div className="space-y-6">
          {/* Health Overview */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">System Health</h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                systemHealth.overallHealth.status === 'healthy' ? 'bg-green-100 text-green-800' :
                systemHealth.overallHealth.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {systemHealth.overallHealth.status.toUpperCase()}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">
                  {systemHealth.overallHealth.totalNotifications}
                </div>
                <div className="text-sm text-gray-600">Notifications (1h)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">
                  {formatPercentage(systemHealth.overallHealth.deliveryRate)}
                </div>
                <div className="text-sm text-gray-600">Delivery Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">
                  {formatPercentage(systemHealth.overallHealth.failureRate)}
                </div>
                <div className="text-sm text-gray-600">Failure Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">
                  {formatDuration(systemHealth.overallHealth.avgProcessingTimeMs)}
                </div>
                <div className="text-sm text-gray-600">Avg Processing</div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {systemHealth.alerts.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-red-800 mb-2">Active Alerts</h3>
              <div className="space-y-2">
                {systemHealth.alerts.map((alert, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <i className={`fas ${
                      alert.type === 'critical' ? 'fa-exclamation-triangle' : 'fa-exclamation-circle'
                    } text-red-600 mt-0.5`}></i>
                    <span className="text-sm text-red-700">{alert.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Channel Health */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Channel Health</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(systemHealth.channelHealth).map(([channel, health]: [string, any]) => (
                <div key={channel} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 capitalize mb-2">{channel.replace('_', '-')}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sent:</span>
                      <span className="font-medium">{health.sent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivered:</span>
                      <span className="font-medium">{health.delivered}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Failed:</span>
                      <span className={`font-medium ${health.failed > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        {health.failed}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Success Rate:</span>
                      <span className="font-medium">
                        {health.sent > 0 ? formatPercentage((health.delivered / health.sent) * 100) : '100%'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}